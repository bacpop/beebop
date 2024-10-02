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

async function computeSample(fileObject, sketchKmerArguments) {
  const { file, hash, filename } = fileObject;
  const { kmerMin, kmerMax, kmerStep } = sketchKmerArguments;

  const amrModule = await AMRprediction();
  const sketchModule = await WebSketch();
  //create working directory and mount file
  createFS(amrModule, file);
  createFS(sketchModule, file);

  const amr = amrModule.make_prediction_json(workdir + "/" + filename);
  // sketch() takes the followings arguments: 
  // filepath, kmer_min, kmer_max, kmer_step, bbits, sketchsize64, codon_phased (boolean), use_rc (boolean)
  const sketch = sketchModule.sketch(workdir + "/" + filename, kmerMin, kmerMax, kmerStep, 14, 156, false, true);

  return { hash, amr, sketch };
}

onmessage = async function (message) {
  const { hashedFiles, sketchKmerArguments } = message.data;
  
  const samples = [];
  for (const fileObject of hashedFiles) {
    const { hash, amr, sketch } = await computeSample(fileObject, sketchKmerArguments);
    samples.push({ hash, amr: JSON.parse(amr), sketch: JSON.parse(sketch), filename: fileObject.filename });
  }
  postMessage(samples);
};
