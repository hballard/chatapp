from graphql.execution.executors.asyncio import AsyncioExecutor
from sanic_graphql import GraphQLView

from . import app
from .schema import schema


@app.listener('before_server_start')
def init_graphql(app, loop):
    app.add_route(
        GraphQLView.as_view(
            schema=schema, graphiql=True, executor=AsyncioExecutor(loop=loop)),
        '/graphql')
