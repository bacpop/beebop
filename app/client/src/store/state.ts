import {
  Versions,
  User,
  Results,
} from '@/types';

export interface RootState {
  versions: Versions | []
  user: User | null
  uploadedFiles: number
  results: Results
  projectHash: string | null
  analysisStatus: string | null
  statusInterval: number | null
}
