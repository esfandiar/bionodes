from lib.db_repository import DbRepository


def get_all_keywords(page: int, page_size: int):
    return DbRepository.get_keywords(page, page_size)


def get_keywords_count():
    return DbRepository.get_keywords_count()


def get_path_between_keywords(keyword1: str, keyword2: str):
    return DbRepository.get_path_between_keywords(keyword1, keyword2)


def get_connected_keywords(keyword: str, max_level: int):
    return DbRepository.get_connected_keywords(keyword, max_level)


def search_for_keywords(search_phrase: str, page: int, page_size: int):
    return DbRepository.search_for_keywords(search_phrase, page, page_size)
