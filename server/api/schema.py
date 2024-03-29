import asyncio
import graphene
from graphene.types.datetime import DateTime
from graphql_ws.pubsub import AsyncioPubsub

from . import app

pubsub = AsyncioPubsub()


class User(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node, )

    id = graphene.ID(required=True)
    name = graphene.String()
    session_id = graphene.String()
    password = graphene.String()
    avatar_url = graphene.String()
    status = graphene.Boolean()
    messages = graphene.List(lambda: Message)

    async def resolve_messages(self, info):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetch('SELECT *'
                                          'FROM messages'
                                          'WHERE user_id = $1', self.id)
                return [Message(**dict(record)) for record in result]

    @classmethod
    async def get_node(cls, info, id):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow('SELECT *'
                                             'FROM users'
                                             'WHERE id = $1', id)
                return User(**record)


class Users(graphene.relay.Connection):
    class Meta:
        node = User


class Message(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node, )

    id = graphene.ID(required=True)
    datetime = DateTime()
    message = graphene.String()
    user_id = graphene.ID()
    user = graphene.Field(lambda: User)

    async def resolve_user(self, info):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow('SELECT *'
                                             'FROM users'
                                             'WHERE id = $1', self.user_id)
                return User(**dict(record))

    @classmethod
    async def get_node(cls, info, id):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow('SELECT *'
                                             'FROM messages'
                                             'WHERE id = $1', id)
                return Message(**dict(record))


class Messages(graphene.relay.Connection):
    class Meta:
        node = Message


class Query(graphene.ObjectType):

    users = graphene.relay.ConnectionField(Users)
    messages = graphene.relay.ConnectionField(Messages)
    node = graphene.relay.Node.Field()

    async def resolve_users(self, info, **args):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetch('SELECT *'
                                          'FROM users '
                                          'WHERE status = TRUE')
                return [User(**dict(record)) for record in result if
                        record['status'] is True]

    async def resolve_messages(self, info, **args):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetch('SELECT * FROM messages')
                return [Message(**dict(record)) for record in result]


class AddUser(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        session_id = graphene.String(required=True)
        password = graphene.String()
        avatar_url = graphene.String()

    ok = graphene.Boolean()
    user = graphene.Field(lambda: User)

    async def mutate(self, info, name, session_id, password=None,
                     avatar_url=None):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow('INSERT INTO users '
                                             '(id, name, session_id, '
                                             'password, avatar_url) '
                                             'VALUES (DEFAULT, $1, $2, $3, $4) '
                                             'RETURNING *', name, session_id,
                                             password, avatar_url)
                user = User(**result)
                ok = True
                await pubsub.publish('users', user)
                return AddUser(user=user, ok=ok)


class EditUser(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        session_id = graphene.String()
        password = graphene.String()
        avatar_url = graphene.String()
        status = graphene.String()

    ok = graphene.Boolean()
    user = graphene.Field(lambda: User)

    async def mutate(self, info, **kwargs):
        id = kwargs['id']
        del kwargs['id']

        i = 2
        index = []
        columns = []
        values = []

        for key, val in kwargs.items():
            if val != "NULL":
                values.append(val)
                columns.append(key)
                index.append('${}'.format(i))
                i += 1
            else:
                index.append("NULL")
                columns.append(key)

        update_columns = (', ').join(columns)
        update_index = (', ').join(index)

        query_string = f'UPDATE users'\
            f'SET ({update_columns}) = ROW ({update_index})'\
            f'WHERE id = $1'\
            f'RETURNING *'

        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow(query_string, int(id), *values)
                user = User(**result)
                ok = True
                return EditUser(user=user, ok=ok)


class DeleteUser(graphene.Mutation):
    class Arguments:
        session_id = graphene.String(required=True)

    ok = graphene.Boolean()
    user = graphene.Field(lambda: User)

    async def mutate(self, info, session_id):

        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow('UPDATE users '
                                             'SET status = FALSE '
                                             'WHERE session_id = $1 '
                                             'RETURNING *', session_id)
                user = User(**result)
                ok = True
                await pubsub.publish('users', user)
                return DeleteUser(user=user, ok=ok)


class AddMessage(graphene.Mutation):
    class Arguments:
        message = graphene.String(required=True)
        user_id = graphene.ID(required=True)

    ok = graphene.Boolean()
    message = graphene.Field(lambda: Message)

    async def mutate(self, info, message, user_id):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow('INSERT INTO messages'
                                             '(id, datetime, message, user_id)'
                                             'VALUES (DEFAULT, NOW(), $1, $2)'
                                             'RETURNING *', message,
                                             int(user_id))
                message = Message(**result)
                ok = True
                await pubsub.publish('messages', message)
                return AddMessage(message=message, ok=ok)


class Mutation(graphene.ObjectType):

    add_user = AddUser.Field()
    edit_user = EditUser.Field()
    delete_user = DeleteUser.Field()
    add_message = AddMessage.Field()


class Subscription(graphene.ObjectType):

    message = graphene.Field(lambda: Message)
    user = graphene.Field(lambda: User)

    async def resolve_message(self, info):
        try:
            sub_id, q = pubsub.subscribe_to_channel('messages')
            while True:
                payload = await q.get()
                yield payload
        except asyncio.CancelledError:
            pubsub.unsubscribe('messages', sub_id)

    async def resolve_user(self, info):
        try:
            sub_id, q = pubsub.subscribe_to_channel('users')
            while True:
                payload = await q.get()
                yield payload
        except asyncio.CancelledError:
            pubsub.unsubscribe('users', sub_id)


schema = graphene.Schema(
    query=Query, mutation=Mutation, subscription=Subscription)
