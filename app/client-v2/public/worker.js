/* eslint-disable no-undef */
if ("function" === typeof importScripts) {
  importScripts("./web_amr_prediction.js");
  importScripts("./web_sketch.js");
}

const workdir = "/working";

function createFS(module, f) {
  // create working directory in filesystem
  module.FS.mkdir(workdir);
  // mount file to work dir
  module.FS.mount(module.FS.filesystems.WORKERFS, { files: [f] }, workdir);
}

onmessage = function (message) {
  // run amr prediction
  AMRprediction().then((module) => {
    const f = message.data.fileObject;
    //create working directory and mount file
    createFS(module, f);
    // make prediction
    const amr_result = module.make_prediction_json(workdir + "/" + f.name);
    // return result
    postMessage({ hash: message.data.hash, type: "amr", result: amr_result });
  });

  // same for sketch
  WebSketch().then((module) => {
    const f = message.data.fileObject;
    createFS(module, f);
    // sketch() takes the followings arguments: filepath, kmer_min, kmer_max, kmer_step,
    // bbits, sketchsize64, codon_phased (boolean), use_rc (boolean)
    const sketch = module.sketch(workdir + "/" + f.name, 14, 29, 3, 14, 156, false, true);
    postMessage({ hash: message.data.hash, type: "sketch", result: sketch });
  });
};
