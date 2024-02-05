export interface Project {
  id: string;
  name: string;
  samplesCount: number;
  timestamp: string;
}
export interface ProjectsResponse {
  data: Project[];
  errors: string[];
  status: string;
}
