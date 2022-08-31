import getters from '@/store/getters';
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
    expect(getters.analysisProgress(state)).toBe(1 / 3);
  });
});
