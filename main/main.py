from main.crawler import Crawler

articles = Crawler().crawl_and_get_articles()
print(articles)
