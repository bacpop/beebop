import mutations from '@/store/mutations';
import { ValueTypes } from '@/types';
import { mockRootState } from '../../mocks';

describe('mutations', () => {
  it('adds Errors', () => {
    const state = mockRootState();
    const mockError = {
      error: 'Error',
      detail: 'Detail',
    };
    mutations.addError(state, mockError);
    expect(state.errors).toStrictEqual([mockError]);
  });
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
    const mockUser = { id: '12345', provider: 'google', name: 'Jane' };
    mutations.setUser(state, mockUser);
    expect(state.user).toBe(mockUser);
  });
  it('adds new file', () => {
    const state = mockRootState();
    const mockFileMetadata = { hash: 'someFileHash', name: 'sampleName.fa' };
    mutations.addFile(state, mockFileMetadata);
    expect(state.results.perIsolate.someFileHash).toStrictEqual({ hash: 'someFileHash', filename: 'sampleName.fa' });
  });
  it('sets sketch values', () => {
    const state = mockRootState({
      results: {
        perIsolate: {
          someFileHash: {
            hash: 'someFileHash',
            filename: 'sampleName.fa',
          },
        },
        perCluster: {},
      },
    });
    const { SKETCH } = ValueTypes;
    const mockIsolateValues = {
      hash: 'someFileHash',
      type: SKETCH,
      result: 'sketch_result',
    };
    mutations.setIsolateValue(state, mockIsolateValues);
    expect(state.results.perIsolate.someFileHash).toStrictEqual({
      hash: 'someFileHash',
      filename: 'sampleName.fa',
      sketch: 'sketch_result',
    });
  });
  it('sets AMR values', () => {
    const state = mockRootState({
      results: {
        perIsolate: {
          someFileHash: {
            hash: 'someFileHash',
            filename: 'sampleName.fa',
          },
        },
        perCluster: {},
      },
    });
    const { AMR } = ValueTypes;
    const mockAMR = {
      hash: 'someFileHash',
      type: AMR,
      result: '{ "Penicillin": 0.5, "Chloramphenicol": 0.2 }',
    };
    mutations.setIsolateValue(state, mockAMR);
    expect(state.results.perIsolate.someFileHash).toStrictEqual({
      hash: 'someFileHash',
      filename: 'sampleName.fa',
      amr: { Penicillin: 0.5, Chloramphenicol: 0.2 },
    });
  });
  it('sets submitStatus', () => {
    const state = mockRootState();
    mutations.setSubmitStatus(state, 'submitted');
    expect(state.submitStatus).toBe('submitted');
  });
  it('sets analysisStatus', () => {
    const state = mockRootState();
    const statusUpdate = {
      assignClusters: 'finished',
      assignLineages: 'finished',
      microreact: 'started',
      network: 'queued',
    };
    mutations.setAnalysisStatus(state, statusUpdate);
    expect(state.analysisStatus).toBe(statusUpdate);
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
        perCluster: {},
      },
    });
    mutations.setClusters(state, { 12: ['someFileHash'], 1: ['someFileHash2'] });
    expect(state.results.perIsolate.someFileHash.cluster).toBe('12');
  });
  it('sets lineages', () => {
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
        perCluster: {},
      },
    });
    mutations.setLineages(state, { 'someFileHash': {
      rank1: "12",
      rank2: "3",
      rank3: "2",
    }, 'someFileHash2': {
      rank1: "15",
      rank2: "4",
      rank3: "2",
    }});
    expect(state.results.perIsolate.someFileHash.lineage).toStrictEqual({
      rank1: "12",
      rank2: "3",
      rank3: "2",
    });
  });
  it('sets MicroreactURL', () => {
    const state = mockRootState();
    const mockURLInfo = {
      cluster: '7',
      url: 'microreact.org/mock',
    };
    mutations.addMicroreactURL(state, mockURLInfo);
    expect(state.results.perCluster[mockURLInfo.cluster]).toStrictEqual({ cluster: '7', microreactURL: 'microreact.org/mock' });
  });
  it('sets Microreact Token', () => {
    const state = mockRootState();
    mutations.setToken(state, 'mock_microreact_token');
    expect(state.microreactToken).toBe('mock_microreact_token');
  });
  it('sets graph', () => {
    const state = mockRootState();
    const mockGraphInfo = {
      cluster: '7',
      graph: '<graph></graph>',
    };
    mutations.addGraphml(state, mockGraphInfo);
    expect(state.results.perCluster[mockGraphInfo.cluster]).toStrictEqual({ cluster: '7', graph: '<graph></graph>' });
  });
});
