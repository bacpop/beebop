import {
  Versions,
  User,
  Results,
  AnalysisStatus,
} from '@/types';

export interface RootState {
  versions: Versions | []
  user: User | null
  results: Results
  analysisStatus: AnalysisStatus
  projectHash: string | null
}
