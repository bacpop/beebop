import type { ProjectOverview } from "@/types/projectTypes";

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
