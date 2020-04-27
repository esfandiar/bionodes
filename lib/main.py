import logging

from lib.crawler import Crawler
from lib.db_repository import DbRepository

logging.basicConfig(format="%(asctime)s - %(message)s", level=logging.WARN)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

logger.info("Start crawling")

# articles = Crawler.crawl_and_get_articles_for_collection("epidemiology")

# for article in articles:
#     query = DbRepository.create_relationship_for_article(article)

articles = DbRepository.get_articles_associated_with_keyword("covid", 10)

logger.info("Finished crawling")
