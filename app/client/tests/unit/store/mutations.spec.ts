import mutations from '@/store/mutations';
import { ValueTypes, Status, AnalysisType } from '@/types';
import { mockRootState } from '../../mocks';

describe('mutations', () => {
  it('sets versioninfo', () => {
    const state = mockRootState();
    const mockVersioninfo = {
      data: [{ name: 'beebop', version: '0.1.0' }, { name: 'poppunk', version: '2.4.0' }],
      errors: [],
      status: 'success',
    };
    mutations.setVersions(state, mockVersioninfo);
    expect(state.versions).toBe(mockVersioninfo);
  });
  it('sets user', () => {
    const state = mockRootState();
    const mockUser = {
      data: { id: '12345', provider: 'google', name: 'Jane' },
      errors: [],
      status: 'success',
    };
    mutations.setUser(state, mockUser);
    expect(state.user).toBe(mockUser);
  });
  it('adds new file', () => {
    const state = mockRootState();
    const mockFileMetadata = { hash: 'someFileHash', name: 'sampleName.fa' };
    mutations.addFile(state, mockFileMetadata);
    expect(state.results.perIsolate.someFileHash).toStrictEqual({ hash: 'someFileHash', filename: 'sampleName.fa' });
  });
  it('sets perIsolate values', () => {
    const state = mockRootState({
      results: {
        perIsolate: {
          someFileHash: {
            hash: 'someFileHash',
            filename: 'sampleName.fa',
          },
        },
      },
    });
    const { AMR } = ValueTypes;
    const mockIsolateValues = {
      hash: 'someFileHash',
      type: AMR,
      result: 'amr_result',
    };
    mutations.setIsolateValue(state, mockIsolateValues);
    expect(state.results.perIsolate.someFileHash).toStrictEqual({
      hash: 'someFileHash',
      filename: 'sampleName.fa',
      amr: 'amr_result',
    });
  });
  it('sets status', () => {
    const state = mockRootState();
    const statusUpdate: Status = {
      task: AnalysisType.MICROREACT,
      data: 'submitted',
    };
    mutations.setStatus(state, statusUpdate);
    expect(state.analysisStatus[statusUpdate.task]).toBe(statusUpdate.data);
  });
  it('sets projectHash', () => {
    const state = mockRootState();
    const phash = 'mock-hash';
    mutations.setProjectHash(state, phash);
    expect(state.projectHash).toBe(phash);
  });
  it('sets statusInterval', () => {
    const state = mockRootState();
    const interval = 122;
    mutations.setStatusInterval(state, interval);
    expect(state.statusInterval).toBe(interval);
  });
  it('sets cluster', () => {
    const state = mockRootState({
      results: {
        perIsolate: {
          someFileHash: {
            hash: 'someFileHash',
          },
          someFileHash2: {
            hash: 'someFileHash2',
          },
        },
      },
    });
    mutations.setClusters(state, { data: { 0: { hash: 'someFileHash', cluster: '12' }, 1: { hash: 'someFileHash2', cluster: '2' } } });
    expect(state.results.perIsolate.someFileHash.cluster).toBe('12');
  });
});
