import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Clear, SearchOutlined } from "@material-ui/icons";
import { Alert, Pagination } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { Subject } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { debounceTime, switchMap, take } from "rxjs/operators";

export interface IKeyword {
  name: string;
}

interface IKeywordPanelProps {
  selectedKeywords: string[];
  onAddKeyword: (keyword: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 600,
  },
  info: {
    marginTop: 5,
    marginBottom: 5,
  },
  search: {
    padding: 5,
    marginTop: 10,
    marginBottom: 5,
  },
}));

export const KeyworPanel: React.FC<IKeywordPanelProps> = (
  props: IKeywordPanelProps
) => {
  const classes = useStyles();

  const [keywords, setKeywords] = useState<IKeyword[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(10);
  const [searchPhrase$] = useState(new Subject<string>());

  const populateKeywordsBySearchPhrase = (
    searchPhrase: string,
    pageNum: number
  ) => {
    if (searchPhrase && searchPhrase.length) {
      fromFetch(
        `http://localhost:5000/keyword/search/${searchPhrase}?page=${pageNum}&page_size=10`
      )
        .pipe(switchMap((response) => response.json()))
        .pipe(take(1))
        .subscribe((returnedKeywordsCount) => {
          setPageCount(Math.ceil(returnedKeywordsCount.count / 10));
          setKeywords(returnedKeywordsCount.keyword);
        });
    } else {
      fromFetch(
        `http://localhost:5000/keyword/all?page=${pageNum}&page_size=10`
      )
        .pipe(switchMap((response) => response.json()))
        .pipe(take(1))
        .subscribe((returnedKeywordsCount) => {
          setPageCount(Math.ceil(returnedKeywordsCount.count / 10));
          setKeywords(returnedKeywordsCount.keyword);
        });
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    populateKeywordsBySearchPhrase(searchValue, value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    searchPhrase$.next(event.target.value);
  };

  const handleClickClearSearch = () => {
    setSearchValue("");
    const pageNum = 1;
    setPage(pageNum);
    populateKeywordsBySearchPhrase("", pageNum);
  };

  useEffect(() => {
    populateKeywordsBySearchPhrase("", 1);
    const searchSubscription = searchPhrase$
      .pipe(debounceTime(300))
      .subscribe((searchPhrase) => {
        const pageNum = 1;
        setPage(pageNum);
        populateKeywordsBySearchPhrase(searchPhrase, pageNum);
      });
    return () => {
      searchSubscription.unsubscribe();
    };
  }, [searchPhrase$]);

  return (
    <div>
      <Alert severity="info" className={classes.info}>
        <div>Select a topic and see related topic</div>
        <div>Select multiple topics to see the relationship between them</div>
      </Alert>
      <FormControl fullWidth className={classes.search}>
        <InputLabel htmlFor="standard-adornment-search">Search</InputLabel>
        <Input
          id="standard-adornment-search"
          value={searchValue}
          onChange={handleSearchChange}
          startAdornment={
            <InputAdornment position="start">
              <SearchOutlined />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="clear keyword search"
                onClick={handleClickClearSearch}
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
      <Paper className={classes.paper}>
        <List component="nav">
          {keywords.map((keyword) => (
            <ListItem
              key={keyword.name}
              button
              selected={props.selectedKeywords.includes(keyword.name)}
              onClick={() => props.onAddKeyword(keyword.name)}
            >
              <ListItemText primary={keyword.name} />
            </ListItem>
          ))}
        </List>
        <Pagination count={pageCount} page={page} onChange={handlePageChange} />
      </Paper>
    </div>
  );
};
