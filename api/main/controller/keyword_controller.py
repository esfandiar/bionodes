from flask import request
from flask_restx import Resource

from api.main.service.keyword_service import (
    get_all_keywords,
    get_connected_keywords,
    get_keywords_count,
    get_path_between_keywords,
    search_for_keywords,
)
from api.main.util.dto import KeywordDto

api = KeywordDto.api
_keyword = KeywordDto.keyword
_keyword_count = KeywordDto.keyword_count


@api.route("/all")
class KeywordListController(Resource):
    @api.doc("list_of_keywords")
    @api.marshal_list_with(_keyword_count)
    def get(self):
        """List all keywords"""
        page = request.args.get("page")
        page_size = request.args.get("page_size")
        page = 0 if not page else int(page)
        page_size = 0 if not page_size else int(page_size)
        keywords = get_all_keywords(page, page_size)
        return keywords


@api.route("/count")
class KeywordCountController(Resource):
    @api.doc("Get keywords count")
    def get(self):
        """Get keywords count"""
        keywords = get_keywords_count()
        return keywords


@api.route("/search/<search_phrase>")
class KeywordSearchController(Resource):
    @api.doc("Search for keywords")
    @api.marshal_list_with(_keyword_count)
    def get(self, search_phrase):
        """Search for keywords"""
        page = request.args.get("page")
        page_size = request.args.get("page_size")
        page = 0 if not page else int(page)
        page_size = 0 if not page_size else int(page_size)
        keywords = search_for_keywords(search_phrase, page, page_size)
        return keywords


@api.route("/relation/<keyword1>/<keyword2>")
@api.param("keyword1", "The first keyword")
@api.param("keyword2", "The final keyword")
@api.response(404, "Relationship not found.")
class KeywordRelationController(Resource):
    @api.doc("Get path between two keywords")
    @api.marshal_with(_keyword)
    def get(self, keyword1: str, keyword2: str):
        """Get path between two keywords"""
        keywords = get_path_between_keywords(keyword1, keyword2)
        if not keywords:
            api.abort(404)
        else:
            return keywords


@api.route("/connections/<keyword>")
@api.param("keyword", "Keyword for which we want to get all the other keywords")
@api.param("max_level", "Maximum search level for keywords")
@api.response(404, "Keyword not found")
class KeywordConnectionsController(Resource):
    @api.doc("Get the keywords connected to given keyword")
    @api.marshal_with(_keyword)
    def get(self, keyword: str):
        """Get the keywords connected to given keyword"""
        max_level = request.args.get("max_level")
        max_level = 2 if not max_level else int(max_level)
        keywords = get_connected_keywords(keyword, max_level)
        if not keywords:
            api.abort(404)
        else:
            return keywords
