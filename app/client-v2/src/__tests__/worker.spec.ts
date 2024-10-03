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
    data: {
      hashedFiles: [
        { hash: "abc123", file: { name: "mockfile1.fa" }, filename: "mockfile1.fa" },
        { hash: "abc2234", file: { name: "mockfile2.fa" }, filename: "mockfile2.fa" }
      ],
      sketchKmerArguments: {
        "Streptococcus pneumoniae": {
          kmerMax: 14,
          kmerMin: 3,
          kmerStep: 3
        }
      }
    }
  };

  (worker.onmessage as any)(message);

  it("creates working dir in FS", async () => {
    return expect(worker.moduleMock.workdir).toBe("/working");
  });

  it("puts file into workdir of FS", async () => {
    expect(worker.moduleMock.data.filedata).toEqual({ files: [message.data.hashedFiles[1].file] });
    return expect(worker.moduleMock.data.dir).toBe(worker.moduleMock.workdir);
  });

  it("sends results back", async () => {
    return expect(worker.postMessage).toHaveBeenCalledWith([
      {
        amr: {
          amr: "/working/mockfile1.fa"
        },
        filename: "mockfile1.fa",
        hash: "abc123",
        sketch: {
          sketch: "/working/mockfile1.fa"
        }
      },
      {
        amr: {
          amr: "/working/mockfile2.fa"
        },
        filename: "mockfile2.fa",
        hash: "abc2234",
        sketch: {
          sketch: "/working/mockfile2.fa"
        }
      }
    ]);
  });
});
