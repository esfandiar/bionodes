from typing import List

from lib.db_repository import DbRepository


def get_all_keywords(page: int, page_size: int):
    return DbRepository.get_keywords(page, page_size)


def get_path_between_keywords(keyword1: str, keyword2: str):
    return DbRepository.get_path_between_keywords(keyword1, keyword2)


def get_connected_keywords(keywords: List[str], max_level: int):
    paths = []
    if len(keywords) > 1:
        for i in range(0, len(keywords)):
            for j in range(i + 1, len(keywords)):
                paths.append(
                    DbRepository.get_path_between_keywords(keywords[i], keywords[j])
                )
    else:
        paths = DbRepository.get_connected_keywords(keywords[0], max_level)
    return paths


def search_for_keywords(search_phrase: str, page: int, page_size: int):
    return DbRepository.search_for_keywords(search_phrase, page, page_size)
