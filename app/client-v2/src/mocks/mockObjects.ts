import type { SketchKmerArguments } from "@/stores/speciesStore";
import type { Project, ProjectOverview, ProjectSample } from "@/types/projectTypes";

export const MOCK_USER = {
  id: "1",
  name: "Test User",
  provider: "test"
};
export const MOCK_SPECIES_CONFIG: Record<string, SketchKmerArguments> = {
  "test species1": {
    kmerMax: 14,
    kmerMin: 3,
    kmerStep: 3
  },
  "test species2": {
    kmerMax: 17,
    kmerMin: 5,
    kmerStep: 4
  }
};
export const MOCK_SPECIES = ["test species1", "test species2"];

export const MOCK_PROJECTS: ProjectOverview[] = [
  {
    id: "1",
    name: "Test Project",
    samplesCount: 10,
    timestamp: "2021-01-01",
    species: MOCK_SPECIES[0]
  },
  {
    id: "2",
    name: "Another Project",
    samplesCount: 5,
    timestamp: "2021-01-02",
    species: MOCK_SPECIES[0]
  },
  {
    id: "3",
    name: "Third Project",
    samplesCount: 15,
    timestamp: "2021-01-03",
    species: MOCK_SPECIES[1]
  }
];

export const MOCK_PROJECT_SAMPLES: ProjectSample[] = [
  {
    hash: "sample1-test-hash",
    filename: "sample1.fasta",
    amr: {
      filename: "sample1.fasta",
      Penicillin: 0.243,
      Chloramphenicol: 0.988,
      Erythromycin: 0.444,
      Tetracycline: 0.08333,
      Trim_sulfa: 0.332221,
      length: true,
      species: true
    },
    sketch: {
      filename: "sample1.fasta",
      md5: "sample1-md5"
    },
    cluster: "GPSC1",
    hasRun: true
  },
  {
    hash: "sample2-test-hash",
    filename: "sample2.fasta",
    amr: {
      filename: "sample2.fasta",
      Penicillin: 0.11,
      Chloramphenicol: 0.77,
      Erythromycin: 0.55,
      Tetracycline: 0.12,
      Trim_sulfa: 0.99,
      length: true,
      species: true
    },
    sketch: { filename: "sample2.fasta", md5: "sample2-md5" },
    cluster: "GPSC2",
    hasRun: true
  },
  {
    hash: "sample3-test-hash",
    filename: "sample3.fasta",
    amr: {
      filename: "sample3.fasta",
      Penicillin: 0.55,
      Chloramphenicol: 0.88,
      Erythromycin: 0.36,
      Tetracycline: 0.36,
      Trim_sulfa: 0.11,
      length: true,
      species: true
    },
    sketch: { filename: "sample3.fasta", md5: "sample3-md5" },
    cluster: "GPSC3",
    hasRun: true
  }
];
export const MOCK_PROJECT_SAMPLES_BEFORE_RUN: ProjectSample[] = [
  {
    hash: "sample1-test-hash",
    filename: "sample1.fasta"
  },
  {
    hash: "sample2-test-hash",
    filename: "sample2.fasta",
    amr: {
      filename: "sample2.fasta",
      Penicillin: 0.11,
      Chloramphenicol: 0.77,
      Erythromycin: 0.55,
      Tetracycline: 0.12,
      Trim_sulfa: 0.99,
      length: true,
      species: true
    }
  },
  {
    hash: "sample3-test-hash",
    filename: "sample3.fasta",
    sketch: { filename: "sample3.fasta", md5: "sample3-md5" }
  }
];
export const MOCK_PROJECT: Project = {
  id: "1",
  name: "Test Project",
  timestamp: "1708958885564",
  hash: "test-hash",
  samples: MOCK_PROJECT_SAMPLES,
  status: {
    assign: "finished",
    visualise: "finished",
    visualiseClusters: {}
  },
  species: MOCK_SPECIES[0]
};

export const MOCK_NETWORK_GRAPH = `<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
<key id="key0" for="node" attr.name="id" attr.type="string" />
<graph id="G" edgedefault="undirected" parse.nodeids="canonical" parse.edgeids="canonical" parse.order="nodesfirst">
  <node id="n0">
    <data key="key0">24775_1#252</data>
    <data key="ref_query">ref</data>
  </node>
  <node id="n1">
    <data key="key0">S_pneumoniae_ASP0581_GCF_003967155_2.fa</data>
    <data key="ref_query">query</data>
  </node>
  <edge id="e0" source="n0" target="n1">
  </edge>
</graph>
</graphml>`;
export const MOCK_CLUSTER_GRAPH_DICT: Record<string, string> = {
  GPSC1: "graph1",
  GPSC2: "graph2",
  GPSC3: "graph3"
};

export const MOCK_MICROREACT_DICT = {
  cluster: "1",
  url: "https://microreact.org/project/1"
};
