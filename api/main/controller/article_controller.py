from flask import request
from flask_restx import Resource, reqparse

from api.main.service.article_service import (
    get_articles_associated_with_keyword,
    search_for_articles,
)
from api.main.util.dto import ArticleDto

api = ArticleDto.api
_article = ArticleDto.article
_article_score = ArticleDto.article_score


@api.route("/search/<search_phrase>")
class ArticleSearchController(Resource):
    @api.doc("Search for articles")
    @api.marshal_list_with(_article_score)
    def get(self, search_phrase):
        """Search for articles"""
        articles = search_for_articles(search_phrase)
        return articles


@api.route("/keyword/<keyword>")
class ArticleKeywordRelationController(Resource):
    @api.doc("Get articles associated with keyword")
    @api.marshal_list_with(_article)
    def get(self, keyword):
        """Get articles associated with keyword"""
        limit = request.args.get("limit")
        limit = 10 if not limit else int(limit)
        articles = get_articles_associated_with_keyword(keyword, limit)
        return articles
