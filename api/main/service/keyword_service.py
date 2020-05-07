from lib.db_repository import DbRepository


def get_all_keywords():
    return DbRepository.get_keywords()
