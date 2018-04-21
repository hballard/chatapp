import graphene
from graphene.types.datetime import DateTime
from graphql_relay import to_global_id

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
                result = await conn.fetch(f'''SELECT *
                                          FROM messages
                                          WHERE user_id = {self.id}''')
                return [Message(**dict(record)) for record in result]

    @classmethod
    async def get_node(cls, info, id):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow(f'''SELECT *
                                             FROM users
                                             WHERE id = {id}''')
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

    async def mutate(self, info, name, password, avatar_url='NULL'):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow(f'''INSERT INTO users
                                            (id, name, password, avatar_url)
                                            VALUES (DEFAULT,
                                            '{name}',
                                            '{password}',
                                            {avatar_url})
                                             RETURNING *''')
                user = User(**result)
                ok = True
                return AddUser(user=user, ok=ok)


class EditUser(graphene.Mutation):

    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        password = graphene.String()
        avatar_url = graphene.String()

    ok = graphene.Boolean()
    user = graphene.Field(lambda: User)

    async def mutate(self, info, id, name, password, avatar_url):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetchrow(f'''UPDATE users
                                             SET name = {name},
                                             password = {password},
                                             avatar_url = {avatar_url}
                                             WHERE id = {id}
                                             RETURNING *''')
                user = User(**result)
                ok = True
                return EditUser(user=user, ok=ok)


# class DeleteUser(graphene.Mutation):
    # pass


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
                record = await conn.fetchrow(f'''SELECT *
                                             FROM users
                                             WHERE id = {self.user_id}''')
                return User(**dict(record))

    @classmethod
    async def get_node(cls, info, id):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow(f'''SELECT *
                                            FROM messages
                                            WHERE id = {id}''')
                return Message(**dict(record))


# class AddMessage(graphene.Mutation):
    # pass


# class EditMessage(graphene.Mutation):
    # pass


# class DeleteMessage(graphene.Mutation):
    # pass


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


schema = graphene.Schema(query=Query, mutation=Mutation)
