MERGE (k:keyword {name:'covid'});
MERGE (k:keyword {name:'pandemic'});
MERGE (k:keyword {name:'respiratory'});
MERGE (k:keyword {name:'lungs'});

MATCH (k:keyword {name:'covid'}), (f:keyword {name:'pandemic'}) CREATE (k)-[:associated_with]->(f);
MATCH (k:keyword {name:'covid'}), (f:keyword {name:'respiratory'}) CREATE (k)-[:associated_with]->(f);
MATCH (k:keyword {name:'respiratory'}), (f:keyword {name:'lungs'}) CREATE (k)-[:associated_with]->(f);

MATCH (k1:keyword {name: 'covid'}), (k2:keyword {name: 'lungs'}),
	path=shortestpath((k1)-[associated_with*]-(k2))
RETURN path;

MATCH (k1:keyword {name:'covid'})-[:associated_with*]->(k2) return k1,k2;

CREATE INDEX idx_keyword
FOR (k:keyword)
ON (k.name);

CREATE INDEX idx_article_title
FOR (a:article)
ON (a.title);

CREATE INDEX idx_article_url
FOR (a:article)
ON (a.url);


MATCH (start:keyword{name:"covid"}), (end:keyword{name:"lungs"})
CALL algo.shortestPath.stream(start, end, "cost")
YIELD nodeId, cost
MATCH (other:Loc) WHERE id(other) = nodeId
RETURN other.name AS name, cost;

-- Create index for full search
CALL db.index.fulltext.createNodeIndex("articleTitleAndAbstract",["article"],["title", "abstract"]);

-- Delete it in case needed
CALL db.index.fulltext.drop('articleTitleAndAbstract');

-- Sample full search text
CALL db.index.fulltext.queryNodes("articleTitleAndAbstract", "temperature") YIELD node, score
RETURN node.title, node.abstract, score;

-- Sample query to find all keywords associted with covid
match path = (k1:keyword {name:'covid'})-[:associated_with*1..2]->(k2:keyword)
RETURN path;

