import { useEffect, useState } from "react";
import React from "react";
import ForceGraph2D from "react-force-graph-2d";
import { IKeyword } from "./Keyword";

interface IGraphProps {
  selectedKeywords: string[];
  onAddKeyboard: (keyword: string) => void;
}

interface IState {
  graphData: any;
}

export const GraphPanel: React.FC<IGraphProps> = (props: IGraphProps) => {
  const [state, setState] = useState<IState>({
    graphData: { nodes: [], links: [] },
  });
  useEffect(() => {
    async function getGraphForKeyword(commaSeparatedKeywords) {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/keyword/connections/${commaSeparatedKeywords}?max_level=1`
      );
      if (response.ok) {
        const returnedKeywordPaths: IKeyword[][] = await response.json();
        const allKeywords = [].concat(...returnedKeywordPaths);
        const keywordValues = new Set(
          allKeywords.map((keyword) => keyword.name)
        );
        const paths = [];
        const uniquePaths = new Set([]);
        returnedKeywordPaths.forEach((keywords) => {
          for (var i = 0; i < keywords.length - 1; i++) {
            const source = keywords[i].name;
            const target = keywords[i + 1].name;
            if (
              !uniquePaths.has(source + target) &&
              !uniquePaths.has(target + source)
            ) {
              paths.push({
                source: source,
                target: target,
                value: 1,
              });
              uniquePaths.add(source + target);
            }
          }
        });

        const keywordNodes = Array.from(keywordValues).map((keywordValue) => ({
          id: keywordValue,
          group: 1,
        }));

        setState({
          graphData: { nodes: keywordNodes, links: paths },
        });
      } else {
        console.log(response);
      }
    }
    if (props.selectedKeywords && props.selectedKeywords.length) {
      const commaSeparatedKeywords = props.selectedKeywords.join(",");
      getGraphForKeyword(commaSeparatedKeywords);
    }
  }, [props.selectedKeywords]);

  if (props.selectedKeywords && props.selectedKeywords.length) {
    return (
      <ForceGraph2D
        width={500}
        height={500}
        graphData={state.graphData}
        nodeAutoColorBy="group"
        nodeColor="rgba(63, 81, 181, 1)"
        nodeCanvasObject={(node: any, ctx: any, globalScale) => {
          const label = node.id as string;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(
            (n) => n + fontSize * 0.2
          ); // some padding

          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = props.selectedKeywords.includes(label)
            ? "rgba(176, 35, 0, 1)"
            : "rgba(63, 81, 181, 1)";
          ctx.fillText(label, node.x, node.y);
        }}
        onNodeClick={(node) => props.onAddKeyboard(node.id as string)}
      />
    );
  } else {
    return <div></div>;
  }
};
