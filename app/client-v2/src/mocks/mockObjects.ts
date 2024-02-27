import type { Project, ProjectOverview, ProjectSample } from "@/types/projectTypes";
import { readFileSync } from "fs";
import path from "path";

export const MOCK_USER = {
  id: "1",
  name: "Test User",
  provider: "test"
};
export const MOCK_PROJECTS: ProjectOverview[] = [
  {
    id: "1",
    name: "Test Project",
    samplesCount: 10,
    timestamp: "2021-01-01"
  },
  {
    id: "2",
    name: "Another Project",
    samplesCount: 5,
    timestamp: "2021-01-02"
  },
  {
    id: "3",
    name: "Third Project",
    samplesCount: 15,
    timestamp: "2021-01-03"
  }
];

export const MOCK_PROJECT_SAMPLES: ProjectSample[] = [
  {
    hash: "sample1-test-hash",
    filename: "sample1.fasta",
    amr: {
      filename: "sample1.fasta",
      Penicillin: 0.24,
      Chloramphenicol: 0.24,
      Erythromycin: 0.24,
      Tetracycline: 0.24,
      Trim_sulfa: 0.24,
      length: true,
      species: true
    },
    sketch: {
      filename: "sample1.fasta",
      md5: "sample1-md5"
    },
    cluster: 1
  },
  {
    hash: "sample2-test-hash",
    filename: "sample2.fasta",
    amr: {
      filename: "sample2.fasta",
      Penicillin: 0.12,
      Chloramphenicol: 0.12,
      Erythromycin: 0.12,
      Tetracycline: 0.12,
      Trim_sulfa: 0.12,
      length: true,
      species: true
    },
    sketch: { filename: "sample2.fasta", md5: "sample2-md5" },
    cluster: 2
  },
  {
    hash: "sample3-test-hash",
    filename: "sample3.fasta",
    amr: {
      filename: "sample3.fasta",
      Penicillin: 0.36,
      Chloramphenicol: 0.36,
      Erythromycin: 0.36,
      Tetracycline: 0.36,
      Trim_sulfa: 0.36,
      length: true,
      species: true
    },
    sketch: { filename: "sample3.fasta", md5: "sample3-md5" },
    cluster: 3
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
    microreact: "finished",
    network: "failed"
  }
};
