from dataclasses import dataclass
from typing import List

from main.keyword import Keyword


@dataclass
class Article:
    url: str
    title: str
    abstract: str
    keywords: List[Keyword]
