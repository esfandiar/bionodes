from dataclasses import dataclass
from typing import List


@dataclass
class Article:
    url: str
    title: str
    abstract: str
    keywords: List[str]
