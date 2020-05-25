from typing import List

from lib.db_repository import DbRepository


def search_for_articles(search_phrase: str):
    articles = DbRepository.search_for_articles(search_phrase)
    articles_dto = [
        {"article": article, "score": score} for (article, score) in articles
    ]
    return articles_dto


def get_articles_associated_with_keyword(
    keywords: List[str], page: int, page_size: int
):
    return DbRepository.get_articles_associated_with_keyword(keywords, page, page_size)
