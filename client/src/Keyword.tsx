import {
  AppBar,
  FormControl,
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
import { GroupWork, SearchOutlined, Timeline } from "@material-ui/icons";
import { Alert, Pagination } from "@material-ui/lab";
import React, { useEffect, useState } from "react";

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
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleTabChange = (
    event: React.ChangeEvent<{}>,
    newTabValue: number
  ) => {
    setTabValue(newTabValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  useEffect(() => {
    async function getKeywords() {
      const response = await fetch(
        `http://localhost:5000/keyword?page=${page}&page_size=10`
      );
      if (response.ok) {
        const returnedKeywords: IKeyword[] = await response.json();
        setKeywords(returnedKeywords);
      } else {
        console.log(response);
      }
    }
    getKeywords();
  }, [page]);

  useEffect(() => {
    async function getKeywordsCount() {
      const response = await fetch("http://localhost:5000/keyword/count");
      if (response.ok) {
        const keywordCount: number = await response.json();
        setPageCount(Math.ceil(keywordCount / 10));
      } else {
        console.log(response);
      }
    }
    getKeywordsCount();
  }, []);

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
            onChange={handleSearchChange}
            startAdornment={
              <InputAdornment position="start">
                <SearchOutlined />
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
