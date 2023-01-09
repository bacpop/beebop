import {
    BeebopError,
    Versions,
    User,
    Results,
    AnalysisStatus
} from "@/types";

export interface RootState {
  errors: BeebopError[]
  versions: Versions | []
  user: User | null
  microreactToken: string | null
  results: Results
  submitStatus: string | null
  analysisStatus: AnalysisStatus
  projectHash: string | null
  projectName: string | null
  statusInterval: number | undefined
}
