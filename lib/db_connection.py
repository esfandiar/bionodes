from neo4j import GraphDatabase
import os


class DbConnection(object):
    _driver = None

    def __init__(self):
        raise RuntimeError("This class cannot be instantiated")

    @classmethod
    def driver(cls):
        if cls._driver is None:
            DB_SERVER = os.environ.get("DB_SERVER")
            db_server = DB_SERVER if DB_SERVER else "localhost"
            cls._driver = GraphDatabase.driver(
                f"bolt://{db_server}:7687", auth=("neo4j", "bionodes"), encrypted=False
            )
        return cls._driver
