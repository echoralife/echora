import topologySource from "../public/topology.json";

export type Room = {
  id: string;
  label: string;
  position: [number, number, number];
  bearing: string;
  observation: string;
};

export type SpatialCommit = {
  id: string;
  parent: string;
  operation: "new-room" | "add-feature";
  target: string;
  feature?: string;
  change: string;
};

type Topology = {
  name: string;
  statement: string;
  agent: {
    id: string;
    memory: string;
    movement: string;
  };
  rule: string;
  rooms: Room[];
  edges: Array<[string, string]>;
  commits: SpatialCommit[];
};

export const topology = topologySource as Topology;
export const rooms = topology.rooms;
export const edges = topology.edges;
export const spatialCommits = topology.commits;
