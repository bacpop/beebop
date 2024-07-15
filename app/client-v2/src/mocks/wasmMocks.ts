export const moduleMock = {
  workdir: "",
  data: {},
  fs: "",
  FS: {
    mkdir(dirname: string) {
      moduleMock.workdir = dirname;
    },
    mount(fs: string, filedata: any, dirname: string) {
      moduleMock.data = { filedata, dir: dirname };
      moduleMock.fs = fs;
    },
    filesystems: {
      WORKERFS: "fs"
    }
  },
  make_prediction_json(path: string) {
    return JSON.stringify({ amr: path });
  },
  sketch(
    path: string,
    /* eslint-disable */
    int1: number,
    int2: number,
    int3: number,
    int4: number,
    int5: number,
    bool1: boolean,
    bool2: boolean
    /* eslint-enable */
  ) {
    return JSON.stringify({ sketch: path });
  }
};

// AMRprediction
export function AMRprediction() {
  return Promise.resolve(moduleMock);
}

// WebSketch
export function WebSketch() {
  return Promise.resolve(moduleMock);
}
