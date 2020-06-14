import {
  Chip,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import { Pagination, Alert } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
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
  };

  useEffect(() => {
    const getArticles = async () => {
      if (props.selectedKeywords && props.selectedKeywords.length) {
        const commaSeparatedKeywords = props.selectedKeywords.join(",");
        const response = await fetch(
          `http://localhost:5000/article/keywords/${commaSeparatedKeywords}?page=${page}&page_size=10`
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
    getArticles();
  }, [page, props.selectedKeywords]);

  useEffect(() => {
    setPage(1);
  }, [props.selectedKeywords]);

  const articlesTitle = () => {
    if (props.selectedKeywords && props.selectedKeywords.length) {
      return (
        <Alert severity="info">
          <div>List of articles for {props.selectedKeywords.join(", ")}</div>
        </Alert>
      );
    } else {
      return <div></div>;
    }
  };

  if (articles) {
    return (
      <div>
        {articlesTitle()}
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
