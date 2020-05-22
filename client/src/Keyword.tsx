import {
  AppBar,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Tabs,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Clear, GroupWork, SearchOutlined, Timeline } from "@material-ui/icons";
import { Alert, Pagination } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { Subject } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { debounceTime, switchMap, take } from "rxjs/operators";

export interface IKeyword {
  name: string;
}

interface IKeywordPanelProps {
  selectedKeyword: string;
  onSelectedKeywordChanged: (keyword: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  tab: {
    // minWidth: 100,
    // width: 100,
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 500,
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
  const [tabValue, setTabValue] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(10);
  const [searchPhrase$] = useState(new Subject<string>());
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleTabChange = (
    _event: React.ChangeEvent<{}>,
    newTabValue: number
  ) => {
    setTabValue(newTabValue);
  };

  useEffect(() => {
    const subscription = searchPhrase$
      .pipe(debounceTime(300))
      .subscribe((searchPhrase) => {
        changeSearchPhrase(searchPhrase);
      });
    return () => subscription.unsubscribe();
  }, []);

  const changeSearchPhrase = (searchPhrase: string) => {
    if (searchPhrase && searchPhrase.length) {
      fromFetch(
        `http://localhost:5000/keyword/search/${searchPhrase}?page=${page}&page_size=10`
      )
        .pipe(switchMap((response) => response.json()))
        .pipe(take(1))
        .subscribe((returnedKeywords) => {
          setKeywords(returnedKeywords);
        });
    } else {
      populateKeywords();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    searchPhrase$.next(event.target.value);
  };

  const handleClickClearSearch = () => {
    setSearchValue("");
    changeSearchPhrase("");
  };

  useEffect(() => {
    const subscription = fromFetch("http://localhost:5000/keyword/count")
      .pipe(switchMap((response) => response.json()))
      .subscribe((keywordCount: number) => {
        setPageCount(Math.ceil(keywordCount / 10));
        populateKeywords();
      });
    return () => subscription.unsubscribe();
  }, []);

  const populateKeywords = () => {
    fromFetch(`http://localhost:5000/keyword/all?page=${page}&page_size=10`)
      .pipe(switchMap((response) => response.json()))
      .pipe(take(1))
      .subscribe((returnedKeywords) => setKeywords(returnedKeywords));
  };

  return (
    <div>
      <AppBar position="static" color="default">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="off"
          aria-label="scrollable prevent tabs example"
        >
          <Tab
            icon={<GroupWork />}
            {...a11yProps(0)}
            classes={{ root: classes.tab }}
          />
          <Tab
            icon={<Timeline />}
            {...a11yProps(1)}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={tabValue} index={0}>
        <Alert severity="info" className={classes.info}>
          Select a topic and see related topic
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
                selected={props.selectedKeyword === keyword.name}
                onClick={() => props.onSelectedKeywordChanged(keyword.name)}
              >
                <ListItemText primary={keyword.name} />
              </ListItem>
            ))}
          </List>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
          />
        </Paper>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Alert severity="info" className={classes.info}>
          See how selected topics are related
        </Alert>
      </TabPanel>
    </div>
  );
};
