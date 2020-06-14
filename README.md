# BioNodes

Find associations between medical articles and their keywords

## DB

Start Neo4j:

```shell
docker run --name db -p 7474:7474 -p 7687:7687 -d -v $(PWD)/db-files/data:/data -v $(PWD)/db-files/logs:/logs -v $(PWD)/db-files/import:/var/lib/neo4j/import -v $(PWD)/db-files/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes --restart=always --network=bionodes neo4j:latest
```

Back up

```shell
docker run -it --name db -p 7474:7474 -p 7687:7687 -v $(PWD)/db-files/data:/data -v $(PWD)/db-files/logs:/logs -v $(PWD)/db-files/import:/var/lib/neo4j/import -v $(PWD)/db-files/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes neo4j:latest /bin/bash

bin/neo4j-admin dump --database=neo4j --to=/var/lib/neo4j/import/backup-20200507.dump
```

Restore

```shell
docker run -it --name db -p 7474:7474 -p 7687:7687 -v $(PWD)/db-files/data:/data -v $(PWD)/db-files/logs:/logs -v $(PWD)/db-files/import:/var/lib/neo4j/import -v $(PWD)/db-files/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes neo4j:latest /bin/bash

mkdir /data/transactions

bin/neo4j-admin load --from=/var/lib/neo4j/import/backup-20200507.dump --database=neo4j --force
```

Neo4j Web UI: <http://localhost:7474>

## API

### Freeze environment

```shell
conda env export > environment.yml
```

### Run API

```shell
conda activate bionodes
/Users/esfandiar/anaconda3/envs/bionodes/bin/python manage.py run
```

### Crawl

```shell
conda activate bionodes
/Users/esfandiar/anaconda3/envs/bionodes/bin/python manage.py crawl [collection]
```

Example:

```shell
conda activate bionodes
/Users/esfandiar/anaconda3/envs/bionodes/bin/python manage.py crawl "epidemiology"
```

Using docker

```shell
docker run -it --rm --network=bionodes 887840629137.dkr.ecr.us-east-1.amazonaws.com/bionodes python manage.py crawl epidemiology
```

## Client

  ```yarn start```
    Starts the development server.

  ```yarn build```
    Bundles the app into static files for production.

  ```yarn test```
    Starts the test runner.

  ```yarn eject```
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

```shell
  cd client
  yarn start
```

## Docker

Login to ECR

```shell
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 887840629137.dkr.ecr.us-east-1.amazonaws.com
```

Build

```shell
docker build -t 887840629137.dkr.ecr.us-east-1.amazonaws.com/bionodes .
```

Tag image

```shell
docker tag bionodes 887840629137.dkr.ecr.us-east-1.amazonaws.com/bionodes
```

Push image

```shell
docker push 887840629137.dkr.ecr.us-east-1.amazonaws.com/bionodes
```

Run container

```shell
docker run --name bionodes-api -e DB_SERVER=db -p 5000:5000 -d --restart=always --network=bionodes 887840629137.dkr.ecr.us-east-1.amazonaws.com/bionodes
```

Create network

```shell
docker network create bionodes
```

## EC2 Setup

Setup Docker in EC2

```shell
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

docker network create bionodes

docker run --name db -p 7474:7474 -p 7687:7687 -d -v $(PWD)/db-data/data:/data -v $(PWD)/db-data/logs:/logs -v $(PWD)/db-data/import:/var/lib/neo4j/import -v $(PWD)/db-data/plugins:/plugins --env NEO4J_AUTH=neo4j/bionodes --restart=always --network=bionodes neo4j:latest

aws configure

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 887840629137.dkr.ecr.us-east-1.amazonaws.com

docker run -it --rm --network=bionodes 887840629137.dkr.ecr.us-east-1.amazonaws.com/bionodes python manage.py crawl epidemiology

docker run --name bionodes-api -p 5000:5000 -d --restart=always --network=bionodes 887840629137.dkr.ecr.us-east-1.amazonaws.com/bionodes
```
