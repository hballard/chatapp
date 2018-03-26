import graphene
from graphene.types.datetime import DateTime

from . import app


class User(graphene.ObjectType):

    class Meta:
        interfaces = (graphene.relay.Node, )

    id = graphene.ID(required=True)
    name = graphene.String()
    password = graphene.String()
    avatar_url = graphene.String()
    messages = graphene.List(lambda: Message)

    async def resolve_messages(self, info):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetch(f'SELECT * FROM messages\
                                          WHERE user_id = {self.id}')
                return [Message(**dict(record)) for record in result]

    @classmethod
    async def get_node(cls, info, id):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow(f'SELECT * FROM users WHERE\
                                             id = {id}')
                return User(**record)


class UserConnection(graphene.relay.Connection):
    class Meta:
        node = User


class Message(graphene.ObjectType):

    class Meta:
        interfaces = (graphene.relay.Node, )

    id = graphene.ID(required=True)
    datetime = DateTime()
    message = graphene.String()
    user_id = graphene.Int()
    user = graphene.Field(lambda: User)

    async def resolve_user(self, info):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow(f'SELECT * FROM users\
                                             WHERE id = {self.user_id}')
                return User(**dict(record))

    @classmethod
    async def get_node(cls, info, id):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                record = await conn.fetchrow(f'SELECT * FROM messages WHERE\
                                             id = {id}')
                return Message(**dict(record))


class MessageConnection(graphene.relay.Connection):
    class Meta:
        node = Message


class Query(graphene.ObjectType):
    users = graphene.List(User)
    users_conn = graphene.relay.ConnectionField(UserConnection)
    messages = graphene.List(Message)
    messages_conn = graphene.relay.ConnectionField(MessageConnection)
    node = graphene.relay.Node.Field()

    async def resolve_users(self, info):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetch('SELECT * FROM users')
                return [User(**dict(record)) for record in result]

    async def resolve_messages(self, info):
        async with app.pool.acquire() as conn:
            async with conn.transaction():
                result = await conn.fetch('SELECT * FROM messages')
                return [Message(**dict(record)) for record in result]


schema = graphene.Schema(query=Query)
