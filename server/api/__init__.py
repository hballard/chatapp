from sanic import Sanic

app = Sanic(__name__)

import api.models
import api.views
