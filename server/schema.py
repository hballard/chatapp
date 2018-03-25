import graphene

from . import app


class User(graphene.ObjectType):
    id = graphene.ID()
    name = graphene.String()
    password = graphene.String()
    avatar_url = graphene.String()


class Message(graphene.ObjectType):
    id = graphene.ID()
    datetime = graphene.types.datetime.DateTime()
    message = graphene.String()
    user_id = graphene.Int()


class Query(graphene.ObjectType):
    users = graphene.List(User)
    messages = graphene.List(Message)

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
