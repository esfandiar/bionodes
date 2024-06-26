import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Link from "@material-ui/core/Link";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { KeyworPanel } from "./Keyword";
import { Card, CardContent, CardHeader } from "@material-ui/core";
import { GraphPanel } from "./Graph";
import { ArticlePanel } from "./Article";
import { SelectedKeywordPanel } from "./SelectedKeyword";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      BioNodes {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

export default function Dashboard() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [selectedKeywords, setSelectedKeywords] = React.useState([]);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const fixedHeightPaper = clsx(classes.paper);

  const addKeyboard = (keyword) => {
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const removeKeyword = (keyword) => {
    setSelectedKeywords(
      selectedKeywords.filter((currentKeyword) => currentKeyword != keyword)
    );
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Discover relationships among medical topics
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={5} lg={5}>
              <Card>
                <CardHeader title="Keywords"></CardHeader>
                <CardContent>
                  <KeyworPanel
                    selectedKeywords={selectedKeywords}
                    onAddKeyword={(keyword) => addKeyboard(keyword)}
                  ></KeyworPanel>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={7} lg={7}>
              <Card>
                <CardHeader title="Selected Keywords"></CardHeader>
                <CardContent>
                  <SelectedKeywordPanel
                    keywords={selectedKeywords}
                    onRemoveKeyword={(keyword) => removeKeyword(keyword)}
                  ></SelectedKeywordPanel>
                </CardContent>
              </Card>
              <Card>
                <CardHeader title="Graph"></CardHeader>
                <CardContent>
                  <GraphPanel
                    selectedKeywords={selectedKeywords}
                    onAddKeyboard={(keyword) => addKeyboard(keyword)}
                  ></GraphPanel>
                </CardContent>
              </Card>
            </Grid>
            {/* Recent Orders */}
            <Grid item xs={12} md={12} lg={12}>
              <Card>
                <CardHeader title="Articles"></CardHeader>
                <CardContent>
                  <Paper className={fixedHeightPaper}>
                    <ArticlePanel
                      selectedKeywords={selectedKeywords}
                    ></ArticlePanel>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>
      </main>
    </div>
  );
}
