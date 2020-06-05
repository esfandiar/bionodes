import concurrent.futures
import logging
import re
from typing import Iterator

from bs4 import BeautifulSoup
import nltk
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer, wordnet
from pdfminer import high_level
import requests

from lib import constants
from lib.article import Article
from lib.db_repository import DbRepository
from lib.keyword import Keyword
from lib.response_stream import ResponseStream

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class Crawler:
    ignore_keywords = ["effectiveness", "measure", "countering", "model"]
    lem: WordNetLemmatizer = None
    stop_words = set([])
    nltk_loaded = False

    def __init__(self):
        pass

    @staticmethod
    def _extract_raw_text(url):
        response = requests.get(url, stream=True)
        stream = ResponseStream(response.iter_content(64))
        try:
            return high_level.extract_text(
                stream,
                password="",
                page_numbers=None,
                maxpages=0,
                caching=True,
                codec="utf-8",
                laparams=None,
            )
        except:
            return ""

    @staticmethod
    def _get_last_page(collection_url: str) -> int:
        res = requests.get(collection_url)
        html = res.text
        soup = BeautifulSoup(html, "html.parser")
        uls = soup.find_all("ul", {"class": "pager-items"})
        if uls:
            return int(uls[0].find_all("li")[-1].text)
        else:
            return 0

    @staticmethod
    def _crawl_and_get_article_for_url(link) -> Article:
        article_href = link.get("href")
        full_article_url = f"{constants.MEDRXIV_URL}{article_href}"
        pdf_url = f"{full_article_url}.full.pdf"
        content = Crawler._extract_raw_text(pdf_url)
        keywords_string = re.findall("(?<=Keywords:)(.*)(?=\\n)", content)
        keywords = []
        if keywords_string:
            keywords_semicolon = [
                keyword.strip().lower()
                for keyword in keywords_string[0].split(";")
                if keyword.strip()
            ]
            keywords_colon = [
                keyword.strip().lower()
                for keyword in keywords_string[0].split(",")
                if keyword.strip()
            ]
            keywords = (
                keywords_semicolon
                if len(keywords_semicolon) > len(keywords_colon)
                else keywords_colon
            )
        title = link.find("span").text
        if not keywords:
            clean_title = title.lower()
            # Remove tags
            clean_title = re.sub("&lt;/?.*?&gt;", " &lt;&gt; ", clean_title)
            # Remove special characters and digits
            clean_title = re.sub("(\\d|\\W)+", " ", clean_title)
            keywords = clean_title.split()
            # Remove the stop words
            keywords = [
                Crawler.lem.lemmatize(word)
                for word in keywords
                if word not in Crawler.stop_words
            ]
            # Tag the words and only take the nouns
            tokens = nltk.word_tokenize(" ".join(keywords))
            tagged = nltk.pos_tag(tokens)
            keywords = [tag[0] for tag in tagged if tag[1] == "NN" and len(tag[1]) > 1]
            # Ignore keywords in ignore list and the ones ending with ing
            keywords = [
                keyword
                for keyword in keywords
                if keyword not in Crawler.ignore_keywords
                and not keyword.endswith("ing")
            ]

        article = Article(
            url=full_article_url,
            title=title,
            abstract="",
            keywords=[Keyword(name=keyword) for keyword in keywords],
        )
        return article

    @staticmethod
    def crawl_and_get_articles_for_collection(collection: str) -> Iterator[Article]:
        if not Crawler.nltk_loaded:
            nltk.download("stopwords")
            nltk.download("wordnet")
            nltk.download("averaged_perceptron_tagger")
            nltk.download("punkt")
            Crawler.stop_words = set(stopwords.words("english"))
            wordnet.ensure_loaded()
            Crawler.lem = WordNetLemmatizer()
        collection_url = f"{constants.MEDRXIV_URL}/collection/{collection}"
        logger.warn("Crawling %s ...", collection_url)
        last_page = Crawler._get_last_page(collection_url)
        logger.warn("There are %d pages in this collection", last_page)

        for page in range(0, last_page):
            url = collection_url if page == 0 else f"{collection_url}?page={page}"
            logger.warn("Crawling page %d of %d. Url: %s ...", page, last_page, url)
            res = requests.get(url)
            html = res.text
            soup = BeautifulSoup(html, "html.parser")

            links = soup.find_all("a", {"class": "highwire-cite-linked-title"})

            with concurrent.futures.ThreadPoolExecutor(len(links)) as executor:
                articles = executor.map(Crawler._crawl_and_get_article_for_url, links)
                for article in articles:
                    yield article

    @staticmethod
    def crawl_and_save_articles_and_keywords(collection: str):
        articles = Crawler.crawl_and_get_articles_for_collection(collection)

        for article in articles:
            DbRepository.create_relationship_for_article(article, collection)
