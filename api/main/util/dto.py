from flask_restx import Namespace, fields


class KeywordDto:
    api = Namespace("keyword", description="keyword related operations")
    keyword = api.model(
        "keyword", {"name": fields.String(required=True, description="keyword name")}
    )
