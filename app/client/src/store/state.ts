import {
  BeebopError,
  Versions,
  User,
  Results,
  AnalysisStatus,
} from '@/types';

export interface RootState {
  errors: BeebopError[]
  versions: Versions | []
  user: User | null
  results: Results
  submitStatus: string | null
  analysisStatus: AnalysisStatus
  projectHash: string | null
  statusInterval: number | undefined
}
