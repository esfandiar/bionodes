from neo4j import GraphDatabase


class DbConnection(object):
    _driver = None

    def __init__(self):
        raise RuntimeError("This class cannot be instantiated")

    @classmethod
    def driver(cls):
        if cls._driver is None:
            cls._driver = GraphDatabase.driver(
                "bolt://db:7687", auth=("neo4j", "bionodes"), encrypted=False
            )
        return cls._driver
