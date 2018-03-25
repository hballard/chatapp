from sanic import Sanic

app = Sanic(__name__)

import server.models
import server.views
