import fs from 'fs';
import vm from 'vm';
import { moduleMock, AMRprediction, WebSketch } from './wasmMocks';

const data = fs.readFileSync('./public/worker.js', { encoding: 'utf8' });
const script = new vm.Script(data);
interface Others {
  log: any,
  moduleMock: any,
  AMRprediction: any,
  WebSketch: any
}

const worker: Partial<Worker> & Others = {
  onmessage: () => {},
  postMessage: jest.fn(),
  log: console.log,  // eslint-disable-line
  moduleMock,
  AMRprediction,
  WebSketch,
};
script.runInNewContext(worker);

describe('Worker', () => {
  const message = {
    data: { hash: 'abc123', fileObject: { name: 'mockfile.fa' } },
  };

  (worker.onmessage as any)(message);

  it('creates working dir in FS', (done) => {
    setTimeout(() => {
      expect(worker.moduleMock.workdir).toBe('/working');
      done();
    });
  });

  it('puts file into workdir of FS', (done) => {
    setTimeout(() => {
      expect(worker.moduleMock.data.filedata).toEqual({ files: [message.data.fileObject] });
      expect(worker.moduleMock.data.dir).toBe(worker.moduleMock.workdir);
      done();
    });
  });

  it('sends results back', (done) => {
    setTimeout(() => {
      expect(worker.postMessage).toHaveBeenCalledWith(
        { hash: 'abc123', type: 'amr', result: '/working/mockfile.fa' },
      );
      expect(worker.postMessage).toHaveBeenCalledWith(
        { hash: 'abc123', type: 'sketch', result: '/working/mockfile.fa' },
      );
      done();
    });
  });
});
