import index from '@/store/index';

describe('store index', () => {
  it('creates a root state', () => {
    expect(index).toHaveProperty('state');
  });

  it('has mutations', () => {
    expect(index).toHaveProperty('_modules.root._rawModule.mutations.addFile');
    expect(index).toHaveProperty('_modules.root._rawModule.mutations.setVersions');
    expect(index).toHaveProperty('_modules.root._rawModule.mutations.setUser');
  });

  it('has actions', () => {
    expect(index).toHaveProperty('_modules.root._rawModule.actions.processFiles');
    expect(index).toHaveProperty('_modules.root._rawModule.actions.getVersions');
    expect(index).toHaveProperty('_modules.root._rawModule.actions.getUser');
  });
});
