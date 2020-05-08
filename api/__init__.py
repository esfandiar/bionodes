from flask_restx import Api
from flask import Blueprint

from api.main.controller.keyword_controller import api as keyword_ns

from api.main.controller.article_controller import api as article_ns

blueprint = Blueprint("api", __name__)

api = Api(
    blueprint,
    title="FLASK RESTPLUS API BOILER-PLATE WITH JWT",
    version="1.0",
    description="a boilerplate for flask restplus web service",
)

api.add_namespace(keyword_ns, path="/keyword")
api.add_namespace(article_ns, path="/article")
