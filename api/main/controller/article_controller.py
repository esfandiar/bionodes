from flask import request
from flask_restx import Resource

from api.main.service.article_service import (
    get_articles_associated_with_keyword,
    search_for_articles,
)
from api.main.util.dto import ArticleDto

api = ArticleDto.api
_article_score = ArticleDto.article_score
_article_count = ArticleDto.article_count


@api.route("/search/<search_phrase>")
class ArticleSearchController(Resource):
    @api.doc("Search for articles")
    @api.marshal_list_with(_article_score)
    def get(self, search_phrase):
        """Search for articles"""
        articles = search_for_articles(search_phrase)
        return articles


@api.route("/keywords/<keyword>")
class ArticleKeywordRelationController(Resource):
    @api.doc("Get articles associated with keyword")
    @api.marshal_list_with(_article_count)
    def get(self, keyword):
        """Get articles associated with keyword"""
        page = request.args.get("page")
        page_size = request.args.get("page_size")
        page = 0 if not page else int(page)
        page_size = 0 if not page_size else int(page_size)
        keywords = keyword.split(",")
        articles = get_articles_associated_with_keyword(keywords, page, page_size)
        return articles
