from sanic import response

from . import app
from .utils import jsonify


@app.get('/')
async def root_get(request):
    async with app.pool.acquire() as conn:
        results = await conn.fetch('SELECT * FROM messages')
        return response.json({'messages': jsonify(results)})
