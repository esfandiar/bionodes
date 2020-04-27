from typing import List, Tuple

from lib.article import Article
from lib.db_connection import DbConnection
from lib.keyword import Keyword


class DbRepository:
    @staticmethod
    def get_keywords() -> List[Keyword]:
        keywords = []

        def execute_query(tx):
            for record in tx.run("match (k:keyword) return k.name"):
                keywords.append(Keyword(name=record["k.name"]))

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return keywords

    @staticmethod
    def get_top_keywords(top_number: int) -> List[Tuple[Keyword, str]]:
        keywords = []

        def execute_query(tx):
            for record in tx.run(
                "match (:article)-[:has_keyword]->(k:keyword)"
                + " with k, count(k) as num order by num DESC"
                + " return k, num"
                + f" limit {top_number}"
            ):
                keywords.append((Keyword(name=record[0]["name"]), record[1]))

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return keywords

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
    def get_articles_associated_with_keyword(keyword: str, limit: int) -> List[Article]:
        articles = []

        def execute_query(tx):
            for record in tx.run(
                "match (a:article)-[:has_keyword]->(k:keyword {name:'"
                + keyword
                + "'})"
                + " with a, count(k) as num order by num DESC"
                + f" return a limit {limit}"
            ):
                article_record = record["a"]
                articles.append(
                    Article(
                        url=article_record["url"],
                        title=article_record["title"],
                        abstract=article_record["abstract"],
                        keywords=[],
                    )
                )

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return articles

    @staticmethod
    def get_connected_keywords(keyword: str, max_level: int = 2) -> List[List[Keyword]]:
        paths = []

        def execute_query(tx):
            for record in tx.run(
                "match path = (k1:keyword {name:'covid'})-[:associated_with*1.."
                + str(max_level)
                + "]->(k2:keyword) RETURN path"
            ):
                paths.append([Keyword(name=node["name"]) for node in record[0].nodes])

        with DbConnection.driver().session() as session:
            session.read_transaction(execute_query)

        return paths

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

            # query = "\n".join(query_list)

            for query in query_list:
                tx.run(query)

        with DbConnection.driver().session() as session:
            session.write_transaction(execute_query)
