import graphene
from graphene.types.datetime import DateTime
from graphql_relay import to_global_id, from_global_id

from . import app


class User(graphene.ObjectType):

    class Meta:
        interfaces = (graphene.relay.Node, )

    id = graphene.ID(required=True)
    name = graphene.String()
    password = graphene.String()
    avatar_url = graphene.String()
    messages = graphene.List(lambda: Message)

    async def resolve_id(self, info):
        return to_global_id('User', self.id)

    async def resolve_messages(self, info):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetch('''SELECT *
                                          FROM messages
                                          WHERE user_id = $1''',
                                          self.id)
                return [Message(**dict(record)) for record in result]

    @classmethod
    async def get_node(cls, info, id):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow('''SELECT *
                                             FROM users
                                             WHERE id = $1''',
                                             id)
                return User(**record)


class Users(graphene.relay.Connection):

    class Meta:
        node = User


class AddUser(graphene.Mutation):

    class Arguments:
        name = graphene.String(required=True)
        password = graphene.String(required=True)
        avatar_url = graphene.String()

    ok = graphene.Boolean()
    user = graphene.Field(lambda: User)

    async def mutate(self, info, name, password, avatar_url=None):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow('''INSERT INTO users
                                             (id, name, password, avatar_url)
                                             VALUES (DEFAULT, $1, $2, $3)
                                             RETURNING *''',
                                             name, password, avatar_url)
                user = User(**result)
                ok = True
                return AddUser(user=user, ok=ok)


class EditUser(graphene.Mutation):

    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String(default_value=None)
        password = graphene.String(default_value=None)
        avatar_url = graphene.String(default_value=None)

    ok = graphene.Boolean()
    user = graphene.Field(lambda: User)

    async def mutate(self, info, **kwargs):
        _, id = from_global_id(kwargs['id'])
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

        query_string = f'''UPDATE users
                          SET ({update_columns}) = ROW ({update_index})
                          WHERE id = $1
                          RETURNING *'''

        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow(query_string,
                                             int(id), *values)
                user = User(**result)
                ok = True
                return EditUser(user=user, ok=ok)


class DeleteUser(graphene.Mutation):

    class Arguments:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()
    user = graphene.Field(lambda: User)

    async def mutate(self, info, id):
        _, id = from_global_id(id)

        query_string = '''DELETE FROM users
                          WHERE id = $1
                          RETURNING *'''

        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow(query_string, int(id))
                user = User(**result)
                ok = True
                return DeleteUser(user=user, ok=ok)


class Message(graphene.ObjectType):

    class Meta:
        interfaces = (graphene.relay.Node, )

    id = graphene.ID(required=True)
    datetime = DateTime()
    message = graphene.String()
    user_id = graphene.Int()
    user = graphene.Field(lambda: User)

    async def resolve_id(self, info):
        return to_global_id('Message', self.id)

    async def resolve_user(self, info):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow('''SELECT *
                                             FROM users
                                             WHERE id = $1''',
                                             self.user_id)
                return User(**dict(record))

    @classmethod
    async def get_node(cls, info, id):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow('''SELECT *
                                             FROM messages
                                             WHERE id = $1''',
                                             id)
                return Message(**dict(record))


class AddMessage(graphene.Mutation):

    class Arguments:
        message = graphene.String(required=True)
        user_id = graphene.ID(required=True)

    ok = graphene.Boolean()
    message = graphene.Field(lambda: Message)

    async def mutate(self, info, message, user_id):
        _, user_id = from_global_id(user_id)
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow('''INSERT INTO messages
                                             (id, datetime, message, user_id)
                                             VALUES (DEFAULT, NOW(), $1, $2)
                                             RETURNING *''',
                                             message, int(user_id))
                message = Message(**result)
                ok = True
                return AddMessage(message=message, ok=ok)


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
                result = await conn.fetch('SELECT * FROM users')
                return [User(**dict(record)) for record in result]

    async def resolve_messages(self, info, **args):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetch('SELECT * FROM messages')
                return [Message(**dict(record)) for record in result]


class Mutation(graphene.ObjectType):

    add_user = AddUser.Field()
    edit_user = EditUser.Field()
    delete_user = DeleteUser.Field()
    add_message = AddMessage.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
