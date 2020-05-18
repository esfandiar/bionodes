import { List, ListItem, ListItemText, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";

export interface IArticle {
  url: string;
  title: string;
  abstract: string;
}

interface IArticlePanelProps {
  selectedKeyword: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export const ArticlePanel: React.FC<IArticlePanelProps> = (
  props: IArticlePanelProps
) => {
  const classes = useStyles();
  const [articles, setArticles] = useState<IArticle[]>([]);
  useEffect(() => {
    async function getArticles() {
      const response = await fetch(
        `http://localhost:5000/article/keyword/${props.selectedKeyword}?limit=20`
      );
      if (response.ok) {
        const returnedArticles: IArticle[] = await response.json();
        setArticles(returnedArticles);
      } else {
        console.log(response);
      }
    }
    if (props.selectedKeyword) {
      getArticles();
    }
  }, [props.selectedKeyword]);

  return (
    <div>
      <List>
        {articles.map((article, index) => (
          <ListItem
            key={index}
            button
            component="a"
            href={article.url}
            target="_blank"
            divider={true}
          >
            <ListItemText primary={article.title} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};
