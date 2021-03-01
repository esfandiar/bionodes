# BioNodes

BioNodes finds associations between medical articles and their keywords. BioNodes crawls <https://www.medrxiv.org>, which is the preprint server for health sciences, and extracts the keywords from each article. It then creates an association between keywords based on the articles they have appeared in, and saves it in a graph database. In this model, keywords that appear in the same article have a direct relationship (i.e. their relationship has a length of 1 in the graph), if a keyword appears in another article, all the keywords from the first article and the second article have a relationship of length 2. The intuition behind this is that if for instance an article discusses how the length of telomeres in chromosomes affects aging and cancer, and another article discusses how the length of telomeres change in space (perhaps as the result of weightlessness) then cancer and weightlessness may be associated by telomeres.

The goal of this project is to help medical scientists and researchers find associations that appeared hidden before.

## Prerequisites

* Docker
* Conda
* Node.js
* Yarn
* DBeaver (optional)

## How to start it up

1. Start up DB and API

```shell
docker-compose up
```

2. Create DB indexes if this is the first time you're creating Neo4j volume. You can use DBeaver or Neo4j Web UI <http://localhost:7474> to connect to DB.

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

## More about the DB

We're using Neo4j as the graph database for this project.

### How to start Neo4j (without using docker-compose)

```shell
docker run --name db -p 7474:7474 -p 7687:7687 -d -v $(PWD)/db-files/data:/data -v $(PWD)/db-files/logs:/logs -v $(PWD)/db-files/import:/var/lib/neo4j/import -v $(PWD)/db-files/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes --restart=always --network=bionodes neo4j:latest
```

After it's started up, you can visit the web UI here: <http://localhost:7474>

### Back up

The following will back up the database into "db-files/data" folder, inside your current folder:

```shell
docker run -it --name db -p 7474:7474 -p 7687:7687 -v $(PWD)/db-files/data:/data -v $(PWD)/db-files/logs:/logs -v $(PWD)/db-files/import:/var/lib/neo4j/import -v $(PWD)/db-files/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes neo4j:latest /bin/bash

bin/neo4j-admin dump --database=neo4j --to=/var/lib/neo4j/import/backup-20200507.dump
```

### Restore

The following will restore the backup file that resides in "db-files/data" folder, inside the current folder:

```shell
docker run -it --name db -p 7474:7474 -p 7687:7687 -v $(PWD)/db-files/data:/data -v $(PWD)/db-files/logs:/logs -v $(PWD)/db-files/import:/var/lib/neo4j/import -v $(PWD)/db-files/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes neo4j:latest /bin/bash

mkdir /data/transactions

bin/neo4j-admin load --from=/var/lib/neo4j/import/backup-20200507.dump --database=neo4j --force
```

## API

We're using Flask for API. In addition, we're using conda to manage the Python packages and the environment.

### Run API without docker

```shell
conda activate bionodes
/Users/esfandiar/anaconda3/envs/bionodes/bin/python manage.py run
```

### Crawl

In order to run the crawler, run the following. You can find more collections by visiting <https://www.medrxiv.org/> and looking at the URL of each subject. For instance, for "Cardiovascular Medicine", pass "cardiovascular-medicine" as the collection parameter.

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

Using docker:

```shell
docker run -it --rm --network=bionodes bionodes-api python manage.py crawl epidemiology
```

### How to freeze environment

If you add a new package, you can freeze the environment.yml file by running the following:

```shell
conda env export > environment.yml
```

## Web Client

  ```yarn start```
    Starts the development server.

  ```yarn build```
    Bundles the app into static files for production.

  ```yarn test```
    Starts the test runner.

  ```yarn eject```
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

## Docker

### Build API image

```shell
docker build -t bionodes-api .
```

### Create network

```shell
docker network create bionodes
```

### Run container

```shell
docker run --name bionodes-api -e DB_SERVER=db -p 5000:5000 -d --restart=always --network=bionodes bionodes-api
```
