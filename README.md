# BioNodes

BioNodes finds associations between medical articles and their keywords. BioNodes crawls <https://www.medrxiv.org>, which is the preprint server for health sciences, and extracts the keywords from each article. It then creates an association between keywords based on the articles they have appeared in, and saves it in a graph database. In this model, keywords that appear in the same article have a direct relationship (i.e. their relationship has a length of 1 in the graph), if a keyword appears in another article, all the keywords from the first article and the second article have a relationship of length 2. The intuition behind this is that if for instance an article discusses how the length of telomeres in chromosomes affects aging and cancer, and another article discusses how the length of telomeres change in space (perhaps as the result of weightlessness) then cancer and weightlessness may be associated by telomeres.

The goal of this project is to help medical scientists and researchers find associations that appeared hidden before.

## Setup

### Prerequisites

* Docker
* Conda (only if you want to do development on API or use it without docker)
* Node.js
* Yarn
* DBeaver (optional)

### How to start it up

1. Start up DB and API

```shell
docker-compose up
```

2. Create DB indexes if this is the first time you're creating Neo4j volume. You can use DBeaver or Neo4j Web UI <http://localhost:7474> to connect to DB. The default username is "neo4j" and the password is "bionodes". If you change this value in docker-compose.yml remember to also change it in db_connection.py.

```
CREATE INDEX idx_keyword
FOR (k:keyword)
ON (k.name);

CREATE INDEX idx_article_title
FOR (a:article)
ON (a.title);

CREATE INDEX idx_article_url
FOR (a:article)
ON (a.url);

CALL db.index.fulltext.createNodeIndex("articleTitleAndAbstract",["article"],["title", "abstract"]);
```

3. Start up web client

```shell
cd client
yarn start
```

### More about the DB

We're using Neo4j as the graph database for this project.

#### How to start Neo4j (without using docker-compose)

1. Create the docker network if it hasn't been done already:

```shell
docker network create bionodes
```

2. Run Neo4j container:

```shell
docker run --name db -p 7474:7474 -p 7687:7687 -d -v $(PWD)/db-files/data:/data -v $(PWD)/db-files/logs:/logs -v $(PWD)/db-files/import:/var/lib/neo4j/import -v $(PWD)/db-files/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes --restart=always --network=bionodes neo4j:latest
```

After it's started up, you can visit the web UI here: <http://localhost:7474>

#### How to Back up

The following will back up the database into "db-files/data" folder, inside your current folder:

```shell
docker run -it --name db -p 7474:7474 -p 7687:7687 -v $(PWD)/db-files/data:/data -v $(PWD)/db-files/logs:/logs -v $(PWD)/db-files/import:/var/lib/neo4j/import -v $(PWD)/db-files/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes neo4j:latest /bin/bash

bin/neo4j-admin dump --database=neo4j --to=/var/lib/neo4j/import/backup-20200507.dump
```

#### How to Restore

The following will restore the backup file that resides in "db-files/data" folder, inside the current folder:

```shell
docker run -it --name db -p 7474:7474 -p 7687:7687 -v $(PWD)/db-files/data:/data -v $(PWD)/db-files/logs:/logs -v $(PWD)/db-files/import:/var/lib/neo4j/import -v $(PWD)/db-files/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes neo4j:latest /bin/bash

mkdir /data/transactions

bin/neo4j-admin load --from=/var/lib/neo4j/import/backup-20200507.dump --database=neo4j --force
```

### API

We're using Flask for API. In addition, we're using conda to manage the Python packages and the environment.

#### Run API with docker

Make sure Neo4j container in the previous step is running first.

1. Build the image:

```shell
docker build -t bionodes-api .
```

2. Run the container:

```shell
docker run --name bionodes-api -e DB_SERVER=db -p 5000:5000 -d --restart=always --network=bionodes bionodes-api
```

#### Run API without docker

```shell
conda activate bionodes
/Users/esfandiar/anaconda3/envs/bionodes/bin/python manage.py run
```

#### Crawl

In order to run the crawler, run the following. You can find more collections by visiting <https://www.medrxiv.org/> and looking at the URL of each subject. For instance, for "Cardiovascular Medicine", pass "cardiovascular-medicine" as the collection parameter.

##### Using docker

```shell
docker run -it --rm --network=bionodes bionodes-api python manage.py crawl epidemiology
```

##### Without using docker

```shell
conda env create -f environment.yml
conda activate bionodes
/Users/esfandiar/anaconda3/envs/bionodes/bin/python manage.py crawl [collection]
```

Example:

```shell
conda activate bionodes
/Users/esfandiar/anaconda3/envs/bionodes/bin/python manage.py crawl "epidemiology"
```

#### How to freeze environment

If you add a new package, you can freeze the environment.yml file by running the following:

```shell
conda env export > environment.yml
```

### Web Client

  ```yarn start```
    Starts the development server.

  ```yarn build```
    Bundles the app into static files for production.

  ```yarn test```
    Starts the test runner.

  ```yarn eject```
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

## How to use BioNodes

1. First make sure that the DB, API, and the Client are up and running, and you've crawled at least one of the topics from <https://www.medrxiv.org> as instructed above.
2. Next visit <http://localhost:3000/>
3. Start by searching for a keyword or pick one from the Keywords panel. In the Graph panel you can see the selected keyword and all its associated keywords. This happens when only a single keyword is selected. In the Articles section you can see all the articles associated with the selected keyword. We can click on each article to view them in medRxiv site. The keywords are sorted by their popularity in all the crawled articles.

![Single Keyword](/doc-images/single-keyword.png)

You can zoom in or out on the graph using scroll wheel or your trackpad.

4. If you select another keyword from the Keywords panel it will be added to the graph along with the previous keyword. In the graph you can see how the new keyword is associated with the previously selected keyword. You can also see all the articles which include the selected keywords.

For example, if we add "immunity" to the list of keywords that already includes "influenza", we see that they are related by "vaccination".

![Two keywords](/doc-images/two-keywords.png)

We can simply click on "vaccination" in the graph to add it to the list of keywords. Now, we can see all the articles that include influenza and vaccination, and vaccination and immunity.

![Two keywords](/doc-images/three-keywords.png)

This is a very contrived example, but it demonstrates the idea behind BioNodes and how it can be used.
