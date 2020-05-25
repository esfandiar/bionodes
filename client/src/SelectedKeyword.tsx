import { Chip, createStyles, Paper } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";

interface ISelectedKeywordProps {
  onRemoveKeyword: (keyword: string) => void;
  keywords: string[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexWrap: "wrap",
      listStyle: "none",
      padding: theme.spacing(0.5),
      margin: 0,
    },
    chip: {
      margin: theme.spacing(0.5),
    },
  })
);

export const SelectedKeywordPanel: React.FC<ISelectedKeywordProps> = (
  props: ISelectedKeywordProps
) => {
  const classes = useStyles();

  const handleDelete = (keyword: string) => () =>
    props.onRemoveKeyword(keyword);

  return (
    <Paper component="ul" className={classes.root}>
      {props.keywords.map((keyword, index) => {
        return (
          <li key={index}>
            <Chip
              label={keyword}
              onDelete={handleDelete(keyword)}
              className={classes.chip}
            />
          </li>
        );
      })}
    </Paper>
  );
};
