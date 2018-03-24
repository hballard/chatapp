from sanic import Sanic

app = Sanic(__name__)

import models
import views
