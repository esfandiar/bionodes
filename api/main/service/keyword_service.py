from lib.db_repository import DbRepository


def get_all_keywords(page: int, page_size: int):
    return DbRepository.get_keywords(page, page_size)


def get_keywords_count():
    return DbRepository.get_keywords_count()


def get_path_between_keywords(keyword1: str, keyword2: str):
    return DbRepository.get_path_between_keywords(keyword1, keyword2)


def get_top_keywords(top_number):
    top_keywords = DbRepository.get_top_keywords(top_number)
    top_keywords_dto = [
        {"name": keyword.name, "article_count": article_count}
        for (keyword, article_count) in top_keywords
    ]
    return top_keywords_dto


def get_connected_keywords(keyword: str, max_level: int):
    return DbRepository.get_connected_keywords(keyword, max_level)
