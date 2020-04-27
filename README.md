# BioNodes

Find associations between medical articles and their keywords

Start Neo4j:

```shell
docker run --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -v $(PWD)/db-files/data:/data \
    -v $(PWD)/db-files/logs:/logs \
    -v $(PWD)/db-files/import:/var/lib/neo4j/import \
    -v $(PWD)/db-files/plugins:/plugins \
    --env NEO4J_AUTH=neo4j/bionodes \
    neo4j:latest
```

Neo4j Web UI: <http://localhost:7474>

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
