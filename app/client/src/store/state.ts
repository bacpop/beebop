import {
  Versions,
  User,
} from '@/types';

export interface RootState {
  versions: Versions | []
  user: User | Record<string, never>
}
