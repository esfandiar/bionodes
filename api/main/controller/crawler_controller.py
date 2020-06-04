import json

from flask_restx import Resource
from flask_restx.namespace import Namespace

from lib.crawler import Crawler

api = Namespace("crawler", description="Crawler related operations")


@api.route("/crawl/<collection>")
class CrawlerController(Resource):
    @api.doc("Crawl collection")
    def post(self, collection):
        """Crawl collection"""
        try:
            Crawler.crawl_and_save_articles_and_keywords(collection)
            return (
                json.dumps({"success": True}),
                200,
                {"ContentType": "application/json"},
            )
        except:
            return (
                json.dumps({"success": False}),
                500,
                {"ContentType": "application/json"},
            )
