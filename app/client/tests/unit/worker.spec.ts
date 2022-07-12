import fs from 'fs';

const vm = require('vm');

const data = fs.readFileSync('./public/worker.js');
const script = new vm.Script(data);
const worker: Partial<Worker> = {
  onmessage: () => {},
  postMessage: jest.fn(),
};
script.runInNewContext(worker);

describe('Worker', () => {
  const message = {
    data: { hash: 'abc123' },
  };

  it('sends results back', async () => {
    (worker.onmessage as any)(message);
    expect(worker.postMessage).toHaveBeenCalledWith(
      { hash: 'abc123', type: 'amr', result: 'AMR' },
    );
    expect(worker.postMessage).toHaveBeenCalledWith(
      { hash: 'abc123', type: 'sketch', result: 'Sketch' },
    );
  });
});
