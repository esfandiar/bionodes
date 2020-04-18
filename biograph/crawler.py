from biograph.article import Article
import pdfminer
from pdfminer import high_level
import requests
import re
from bs4 import BeautifulSoup
from biograph.response_stream import ResponseStream
from typing import List
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from nltk.stem.wordnet import WordNetLemmatizer


class Crawler:
    def __init__(self):
        nltk.download("stopwords")
        nltk.download("wordnet")
        self.stop_words = set(stopwords.words("english"))
        self.ps = PorterStemmer()
        self.lem = WordNetLemmatizer()

    def _extract_raw_text(self, url):
        response = requests.get(url, stream=True)
        stream = ResponseStream(response.iter_content(64))
        return high_level.extract_text(
            stream,
            password="",
            page_numbers=None,
            maxpages=0,
            caching=True,
            codec="utf-8",
            laparams=None,
        )

    def crawl_and_get_articles(self) -> List[Article]:
        res = requests.get("https://www.medrxiv.org/collection/epidemiology?page=1")
        html = res.text
        soup = BeautifulSoup(html, "html.parser")

        articles: List[Article] = []
        for link in soup.find_all("a", {"class": "highwire-cite-linked-title"}):
            article_href = link.get("href")
            full_article_url = f"https://www.medrxiv.org{article_href}"
            pdf_url = f"{full_article_url}.full.pdf"
            content = self._extract_raw_text(pdf_url)
            keywords_string = re.findall("(?<=Keywords:)(.*)(?=\\n)", content)
            keywords = []
            if keywords_string:
                keywords = [
                    keyword.strip()
                    for keyword in keywords_string[0].split(";")
                    if keyword.strip()
                ]
            title = link.find("span").text
            if not keywords:
                clean_title = title
                # clean_title = re.sub("[^a-zA-Z]", " ", title).lower()
                clean_title = re.sub("&lt;/?.*?&gt;", " &lt;&gt; ", clean_title)
                clean_title = re.sub("(\\d|\\W)+", " ", clean_title)
                keywords = clean_title.split()
                keywords = [
                    self.lem.lemmatize(word)
                    for word in keywords
                    if word not in self.stop_words
                ]

            article = Article(
                url=full_article_url, title=title, abstract="", keywords=keywords,
            )
            articles.append(article)
        return articles
