import { getters } from '@/store/getters';
import { mockRootState } from '../../mocks';

describe('getters', () => {
  it('calculates analysisProgress', () => {
    const state = mockRootState({
      projectHash: 'randomHash',
      submitStatus: 'submitted',
      analysisStatus: {
        assign: 'finished',
        microreact: 'started',
        network: 'queued',
      },
    });
    expect(getters.analysisProgress(state, 'analysisProgress', state, 'analysisProgress')).toStrictEqual({
      finished: 1,
      progress: 0.3333333333333333,
      total: 3,
    });
  });
});
