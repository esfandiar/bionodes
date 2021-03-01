-- Create these indexes the first time DB is created:

-- Create indexes
CREATE INDEX idx_keyword
FOR (k:keyword)
ON (k.name);

CREATE INDEX idx_article_title
FOR (a:article)
ON (a.title);

CREATE INDEX idx_article_url
FOR (a:article)
ON (a.url);

-- Create index for full search
CALL db.index.fulltext.createNodeIndex("articleTitleAndAbstract",["article"],["title", "abstract"]);




-- Sample queries. These are just samples and are included just for reference:

-- Create keywords
MERGE (k:keyword {name:'covid'});
MERGE (k:keyword {name:'pandemic'});
MERGE (k:keyword {name:'respiratory'});
MERGE (k:keyword {name:'lungs'});

-- Create associations
MATCH (k:keyword {name:'covid'}), (f:keyword {name:'pandemic'}) CREATE (k)-[:associated_with]->(f);
MATCH (k:keyword {name:'covid'}), (f:keyword {name:'respiratory'}) CREATE (k)-[:associated_with]->(f);
MATCH (k:keyword {name:'respiratory'}), (f:keyword {name:'lungs'}) CREATE (k)-[:associated_with]->(f);

-- Return shortest path
MATCH (k1:keyword {name: 'covid'}), (k2:keyword {name: 'lungs'}),
	path=shortestpath((k1)-[associated_with*]-(k2))
RETURN path;

-- Find any keyword that is associated with covid
MATCH (k1:keyword {name:'covid'})-[:associated_with*]->(k2) return k1,k2;


MATCH (start:keyword{name:"covid"}), (end:keyword{name:"lungs"})
CALL algo.shortestPath.stream(start, end, "cost")
YIELD nodeId, cost
MATCH (other:Loc) WHERE id(other) = nodeId
RETURN other.name AS name, cost;

-- Delete the index in case needed
CALL db.index.fulltext.drop('articleTitleAndAbstract');

-- Sample full search text
CALL db.index.fulltext.queryNodes("articleTitleAndAbstract", "temperature") YIELD node, score
RETURN node.title, node.abstract, score;

-- Sample query to find all keywords associted with covid
match path = (k1:keyword {name:'covid'})-[:associated_with*1..2]->(k2:keyword)
RETURN path;
