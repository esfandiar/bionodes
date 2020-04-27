from dataclasses import dataclass
from typing import List

from lib.keyword import Keyword


@dataclass
class Article:
    url: str
    title: str
    abstract: str
    keywords: List[Keyword]
