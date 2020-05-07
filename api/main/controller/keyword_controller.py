from flask import request
from flask_restx import Resource

from api.main.service.keyword_service import get_all_keywords
from api.main.util.dto import KeywordDto

api = KeywordDto.api
_keyword = KeywordDto.keyword


@api.route("/")
class KeywordList(Resource):
    @api.doc("list_of_keywords")
    @api.marshal_list_with(_keyword)
    def get(self):
        """List all keywords"""
        keywords = get_all_keywords()
        return keywords

    # @api.response(201, "User successfully created.")
    # @api.doc("create a new user")
    # @api.expect(_user, validate=True)
    # def post(self):
    #     """Creates a new User """
    #     data = request.json
    #     return save_new_user(data=data)


# @api.route("/<public_id>")
# @api.param("public_id", "The User identifier")
# @api.response(404, "User not found.")
# class User(Resource):
#     @api.doc("get a user")
#     @api.marshal_with(_user)
#     def get(self, public_id):
#         """get a user given its identifier"""
#         user = get_a_user(public_id)
#         if not user:
#             api.abort(404)
#         else:
#             return user
