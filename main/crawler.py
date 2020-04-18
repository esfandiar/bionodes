import re
from typing import List

from bs4 import BeautifulSoup
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from nltk.stem.wordnet import WordNetLemmatizer
from pdfminer import high_level
import requests

from main.article import Article
from main.response_stream import ResponseStream


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
                url=full_article_url, title=title, abstract="", keywords=keywords,
            )
            articles.append(article)
        return articles
