import { AnalysisType } from '@/types';
import { RootState } from '@/store/state';

export default {
  analysisProgress(state: RootState) {
    let progress = 0;
    const total = Object.keys(state.analysisStatus).length;
    Object.keys(state.analysisStatus).forEach((element: string) => {
      if (state.analysisStatus[element as AnalysisType] === 'finished') {
        progress += 1;
      }
    });
    return progress / total;
  },
};
