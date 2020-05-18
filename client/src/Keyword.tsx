import { useEffect, useState } from "react";
import React from "react";
import { List, ListItem, ListItemText } from "@material-ui/core";

export interface IKeyword {
  name: string;
}

interface IKeywordPanelProps {
  selectedKeyword: string;
  onSelectedKeywordChanged: (keyword: string) => void;
}

export const KeyworPanel: React.FC<IKeywordPanelProps> = (
  props: IKeywordPanelProps
) => {
  const [keywords, setKeywords] = useState<IKeyword[]>([]);
  useEffect(() => {
    async function getKeywords() {
      const response = await fetch("http://localhost:5000/keyword");
      if (response.ok) {
        const returnedKeywords: IKeyword[] = await response.json();
        setKeywords(returnedKeywords);
      } else {
        console.log(response);
      }
    }
    getKeywords();
  }, []);

  return (
    <div>
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
    </div>
  );
};
