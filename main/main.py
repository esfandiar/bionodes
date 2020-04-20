import logging

from main.crawler import Crawler
from main.db_repository import DbRepository

logging.basicConfig(format="%(asctime)s - %(message)s", level=logging.WARN)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

logger.info("Start crawling")

crawler = Crawler()
articles = crawler.crawl_and_get_articles_for_collection("epidemiology")

for article in articles:
    query = DbRepository.create_relationship_for_article(article)

logger.info("Finished crawling")
