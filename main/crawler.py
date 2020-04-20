import logging
import re
from typing import List

from bs4 import BeautifulSoup
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from nltk.stem.wordnet import WordNetLemmatizer
from pdfminer import high_level
import requests

from main import constants
from main.article import Article
from main.keyword import Keyword
from main.response_stream import ResponseStream

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class Crawler:
    def __init__(self):
        nltk.download("stopwords")
        nltk.download("wordnet")
        nltk.download("averaged_perceptron_tagger")
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

    def _get_last_page(self, collection_url: str) -> int:
        res = requests.get(collection_url)
        html = res.text
        soup = BeautifulSoup(html, "html.parser")
        uls = soup.find_all("ul", {"class": "pager-items"})
        if uls:
            return int(uls[0].find_all("li")[-1].text)
        else:
            return 0

    def crawl_and_get_articles_for_collection(self, collection: str) -> List[Article]:
        collection_url = f"{constants.MEDRXIV_URL}/collection/{collection}"
        logger.info("Crawling %s ...", collection_url)
        last_page = self._get_last_page(collection_url)
        logger.info("There are %d pages in this collection", last_page)

        articles: List[Article] = []

        for page in range(0, last_page):
            url = collection_url if page == 0 else f"{collection_url}?page={page}"
            logger.info("Crawling page %d of %d. Url: %s ...", page, last_page, url)
            res = requests.get(url)
            html = res.text
            soup = BeautifulSoup(html, "html.parser")

            for link in soup.find_all("a", {"class": "highwire-cite-linked-title"}):
                article_href = link.get("href")
                full_article_url = f"{constants.MEDRXIV_URL}{article_href}"
                pdf_url = f"{full_article_url}.full.pdf"
                content = self._extract_raw_text(pdf_url)
                keywords_string = re.findall("(?<=Keywords:)(.*)(?=\\n)", content)
                keywords = []
                if keywords_string:
                    keywords = [
                        keyword.strip().lower()
                        for keyword in keywords_string[0].split(";")
                        if keyword.strip()
                    ]
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
                        self.lem.lemmatize(word)
                        for word in keywords
                        if word not in self.stop_words
                    ]
                    # Tag the words and only take the nouns
                    tokens = nltk.word_tokenize(" ".join(keywords))
                    tagged = nltk.pos_tag(tokens)
                    keywords = [
                        tag[0] for tag in tagged if tag[1] == "NN" and len(tag[1]) > 1
                    ]

                article = Article(
                    url=full_article_url,
                    title=title,
                    abstract="",
                    keywords=[Keyword(name=keyword) for keyword in keywords],
                )
                articles.append(article)
            logger.info(
                "Finished crawling page. %d articles crawled so far", len(articles)
            )

        logger.info("Crawled %d articles in total", len(articles))
        return articles
