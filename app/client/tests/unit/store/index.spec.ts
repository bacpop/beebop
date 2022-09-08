import actions from '@/store/actions';
import index from '@/store/index';
import mutations from '@/store/mutations';
import { getters } from '@/store/getters';

describe('store index', () => {
  it('creates a root state', () => {
    expect(index).toHaveProperty('state');
  });

  it('has mutations', () => {
    expect((index as any)._modules.root._rawModule.mutations).toMatchObject(mutations);
  });

  it('has actions', () => {
    expect((index as any)._modules.root._rawModule.actions).toMatchObject(actions);
  });

  it('has getters', () => {
    expect((index as any)._modules.root._rawModule.getters).toMatchObject(getters);
  });
});
