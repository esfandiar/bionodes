from flask_restx import Namespace, fields


class KeywordDto:
    api = Namespace("keyword", description="Keyword related operations")
    keyword = api.model(
        "keyword", {"name": fields.String(required=True, description="keyword name")}
    )
    keyword_article_count = api.model(
        "keyword",
        {
            "name": fields.String(required=True, description="keyword name"),
            "article_count": fields.Integer(
                required=True, description="Number of articles with this keyword"
            ),
        },
    )
    keyword_count = api.model(
        "keyword",
        {"keyword": fields.Nested(keyword), "count": fields.Integer(required=True)},
    )


class ArticleDto:
    api = Namespace("article", description="Article related operations")
    article = api.model(
        "article",
        {
            "url": fields.String(required=True, description="URL for article"),
            "title": fields.String(required=True, description="Title for article"),
            "abstract": fields.String(
                required=False, description="Abstract for article"
            ),
            "keywords": fields.Nested(KeywordDto.keyword),
        },
    )
    article_score = api.model(
        "article",
        {"article": fields.Nested(article), "score": fields.Float(required=True)},
    )
    article_count = api.model(
        "article",
        {"articles": fields.Nested(article), "count": fields.Integer(required=True)},
    )
