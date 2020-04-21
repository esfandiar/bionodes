from typing import List

from main.article import Article
from main.db_connection import DbConnection
from main.keyword import Keyword


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
