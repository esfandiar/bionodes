from typing import Dict, List, Tuple

from lib.article import Article
from lib.db_connection import DbConnection
from lib.keyword import Keyword


class DbRepository:
    @staticmethod
    def get_keywords(page=0, page_size=0) -> Dict:
        keywords_count = {}

        def execute_query(tx):
            skip_num = (page - 1) * page_size
            page_query = f" skip {skip_num} limit {page_size}" if page else ""
            query = (
                "match (k:keyword)"
                + " with count(k) as total"
                + " match (:article)-[r:has_keyword]->(k:keyword)"
                + " with k, count(r) as num, total order by num DESC"
                + " return k, total"
                + page_query
            )
            keywords = []
            for record in tx.run(query):
                keywords.append(Keyword(name=record[0]["name"]))
                keywords_count["count"] = record[1]
            keywords_count["keyword"] = keywords

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return keywords_count

    @staticmethod
    def search_for_keywords(search_phrase: str, page=0, page_size=0) -> Dict:
        keywords_count = {}

        def execute_query(tx):
            skip_num = (page - 1) * page_size
            page_query = f" skip {skip_num} limit {page_size}" if page else ""
            query = (
                f"match (k:keyword) where k.name contains '{search_phrase}'"
                + " with count(k) as total"
                + f" match (k:keyword) where k.name contains '{search_phrase}'"
                + " return k, total"
                + page_query
            )
            keywords = []
            for record in tx.run(query):
                keywords.append(Keyword(name=record[0]["name"]))
                keywords_count["count"] = record[1]
            keywords_count["keyword"] = keywords

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return keywords_count

    @staticmethod
    def get_path_between_keywords(keyword1: str, keyword2: str) -> List[Keyword]:
        keywords = []

        def execute_query(tx):
            for record in tx.run(
                "MATCH (k1:keyword {name: '"
                + keyword1
                + "'}), (k2:keyword {name: '"
                + keyword2
                + "'}),"
                + "path=shortestpath((k1)-[associated_with*]-(k2)) RETURN path"
            ):
                keywords.extend(
                    [Keyword(name=node["name"]) for node in record[0].nodes]
                )

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return keywords

    @staticmethod
    def get_connected_keywords(keyword: str, max_level: int = 2) -> List[List[Keyword]]:
        paths = []

        def execute_query(tx):
            for record in tx.run(
                "match path = (k1:keyword {name:'"
                + keyword
                + "'})-[:associated_with*1.."
                + str(max_level)
                + "]-(k2:keyword) RETURN path"
            ):
                paths.append([Keyword(name=node["name"]) for node in record[0].nodes])

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return paths

    @staticmethod
    def search_for_articles(search_phrase: str) -> List[Tuple[Article, int]]:
        articles = []

        def execute_query(tx):
            for record in tx.run(
                f"CALL db.index.fulltext.queryNodes('articleTitleAndAbstract', '{search_phrase}')"
                + " YIELD node, score"
                + " RETURN node, score"
            ):
                articles.append(
                    (
                        Article(
                            url=record[0]["url"],
                            title=record[0]["title"],
                            abstract=record[0]["url"],
                            keywords=[],
                        ),
                        record[1],
                    )
                )

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return articles

    @staticmethod
    def get_articles_associated_with_keyword(
        keywords: List[str], page=0, page_size=0
    ) -> Dict:
        articles_count = {}
        where_clause = " or ".join([f"k.name='{keyword}'" for keyword in keywords])

        def execute_query(tx):
            skip_num = (page - 1) * page_size
            page_query = f" skip {skip_num} limit {page_size}" if page else ""
            query = (
                "match (a:article)-[r:has_keyword]->(k:keyword)"
                + f" where {where_clause}"
                + " with count(distinct a) as total"
                + " match (a:article)-[r:has_keyword]->(k:keyword)"
                + f" where {where_clause}"
                + " with a, count(distinct k.name) as num, collect(k) as keywords, total order by num DESC"
                + f" return a, keywords, total"
                + page_query
            )
            articles = []
            for record in tx.run(query):
                article_record = record["a"]
                unique_keywords = set(
                    [keyword["name"] for keyword in record["keywords"]]
                )
                keywords = [(Keyword(name=keyword)) for keyword in unique_keywords]
                articles.append(
                    Article(
                        url=article_record["url"],
                        title=article_record["title"],
                        abstract=article_record["abstract"],
                        keywords=keywords,
                    )
                )
                articles_count["count"] = record["total"]
            articles_count["articles"] = articles

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return articles_count

    @staticmethod
    def create_relationship_for_article(article: Article):
        def execute_query(tx):
            query_list = [
                "MERGE (k:keyword {name:'" + keyword.name.replace("'", "\\'") + "'});"
                for keyword in article.keywords
            ]
            query_list.append(
                "MERGE (k:article {title:'"
                + article.title.replace("'", "\\'")
                + "',url:'"
                + article.url
                + "'});"
            )
            for i in range(0, len(article.keywords)):
                for j in range(i + 1, len(article.keywords)):
                    query = (
                        "MATCH (k1:keyword {name:'"
                        + article.keywords[i].name.replace("'", "\\'")
                        + "'}), (k2:keyword {name:'"
                        + article.keywords[j].name.replace("'", "\\'")
                        + "'}) CREATE (k1)-[:associated_with]->(k2);"
                    )
                    query_list.append(query)
                query_list.append(
                    "MATCH (k:keyword {name:'"
                    + article.keywords[i].name.replace("'", "\\'")
                    + "'}), (a:article {url:'"
                    + article.url
                    + "'}) CREATE (a)-[:has_keyword]->(k);"
                )

            for query in query_list:
                tx.run(query)

        with DbConnection.driver().session() as session:
            session.write_transaction(execute_query)
