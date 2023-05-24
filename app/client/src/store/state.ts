import {
    BeebopError,
    Versions,
    User,
    Results,
    AnalysisStatus, SavedProject
} from "@/types";

export interface RootState {
  errors: BeebopError[]
  versions: Versions | []
  user: User | null
  microreactToken: string | null
  results: Results
  submitStatus: string | null
  analysisStatus: AnalysisStatus
  projectName: string | null
  projectId: string | null
  projectHash: string | null
  statusInterval: number | undefined
  savedProjects: SavedProject[]
  loadingProject: boolean
  loadingProjectMessages: string[]
}
