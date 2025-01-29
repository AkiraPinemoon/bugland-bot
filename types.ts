import type { GraphEdge, GraphNode } from "@vue-flow/core";

export type Group = {
  id: string;
  name: string;
  root: string;
  flow: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
};
