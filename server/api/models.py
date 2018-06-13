from asyncpg import create_pool

from . import app

DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'heath',
    'password': 'password',
    'port': '5432',
    'database': 'chatapp'
}

users_table = """CREATE TABLE IF NOT EXISTS users (
                 id serial PRIMARY KEY,
                 name text,
                 password text,
                 avatar_url text,
                 status boolean DEFAULT TRUE
              );"""

messages_table = """CREATE TABLE IF NOT EXISTS messages (
                    id serial PRIMARY KEY,
                    datetime timestamp,
                    message text,
                    user_id integer references users(id)
                 );"""


@app.listener('before_server_start')
async def register_db(app, loop):

    # create connection pool and attach to app object
    app.pool = await create_pool(**DB_CONFIG, loop=loop)

    async with app.pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(users_table)
            await conn.execute(messages_table)
