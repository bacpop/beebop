import {
  Versions,
  User,
  Results,
} from '@/types';

export interface RootState {
  versions: Versions | []
  user: User | null
  results: Results
}
