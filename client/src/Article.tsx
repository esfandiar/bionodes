import {
  List,
  ListItem,
  ListItemText,
  makeStyles,
  ListItemSecondaryAction,
  Chip,
  Paper,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Pagination } from "@material-ui/lab";
import { IKeyword } from "./Keyword";

export interface IArticle {
  url: string;
  title: string;
  abstract: string;
  keywords: IKeyword[];
}

interface IArticlePanelProps {
  selectedKeywords: string[];
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  chipsUl: {
    display: "flex",
    flexWrap: "wrap",
    listStyle: "none",
    padding: theme.spacing(0.5),
    margin: 0,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

export const ArticlePanel: React.FC<IArticlePanelProps> = (
  props: IArticlePanelProps
) => {
  const classes = useStyles();

  const [articles, setArticles] = useState<IArticle[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(10);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    getArticles(value);
  };

  const getArticles = async (pageNum) => {
    if (props.selectedKeywords && props.selectedKeywords.length) {
      const commaSeparatedKeywords = props.selectedKeywords.join(",");
      const response = await fetch(
        `http://localhost:5000/article/keywords/${commaSeparatedKeywords}?page=${pageNum}&page_size=10`
      );
      if (response.ok) {
        const responseBody = await response.json();
        setPageCount(Math.ceil(responseBody.count / 10));
        setArticles(responseBody.articles);
      } else {
        console.log(response);
      }
    }
  };

  useEffect(() => {
    getArticles(1);
  }, [props.selectedKeywords]);

  if (articles) {
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
              <ListItemSecondaryAction>
                <ul className={classes.chipsUl}>
                  {article.keywords.map((keyword, innerIndex) => (
                    <li key={innerIndex}>
                      <Chip label={keyword.name} className={classes.chip} />
                    </li>
                  ))}
                </ul>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Pagination count={pageCount} page={page} onChange={handlePageChange} />
      </div>
    );
  } else {
    return <div></div>;
  }
};
