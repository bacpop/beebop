import fs from "fs";
import vm from "vm";
import { moduleMock, AMRprediction, WebSketch } from "@/mocks/wasmMocks";

const data = fs.readFileSync("./public/worker.js", { encoding: "utf8" });
const script = new vm.Script(data);
interface Others {
  log: any;
  moduleMock: any;
  AMRprediction: any;
  WebSketch: any;
}

const worker: Partial<Worker> & Others = {
  onmessage: () => {},
  postMessage: vitest.fn() as any,
  log: console.log, // eslint-disable-line
  moduleMock,
  AMRprediction,
  WebSketch
};
script.runInNewContext(worker);

describe("Worker", () => {
  const message = {
    data: { hash: "abc123", fileObject: { name: "mockfile.fa" } }
  };

  (worker.onmessage as any)(message);

  it("creates working dir in FS", async () => {
    return expect(worker.moduleMock.workdir).toBe("/working");
  });

  it("puts file into workdir of FS", async () => {
    expect(worker.moduleMock.data.filedata).toEqual({ files: [message.data.fileObject] });
    return expect(worker.moduleMock.data.dir).toBe(worker.moduleMock.workdir);
  });

  it("sends results back", async () => {
    expect(worker.postMessage).toHaveBeenCalledWith({ hash: "abc123", type: "amr", result: "/working/mockfile.fa" });
    return expect(worker.postMessage).toHaveBeenCalledWith({
      hash: "abc123",
      type: "sketch",
      result: "/working/mockfile.fa"
    });
  });
});
