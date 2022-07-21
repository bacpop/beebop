if ('function' === typeof importScripts) {
  importScripts('./web_amr_prediction.js');
  importScripts('./web_sketch.js');
}

onmessage = function (message) {
  // run amr prediction
  AMRprediction().then(module => {
    var f = message.data.fileObject;
    // create working directory in filesystem
    module.FS.mkdir('/working');
    // add file to work dir
    module.FS.mount(module.FS.filesystems.WORKERFS, { files: [f] }, '/working');
    // make prediction
    var amr_result = module.make_prediction("/working/" + f.name);
    // return result
    postMessage({ hash: message.data.hash, type: 'amr', result: amr_result });
  });

  // same for sketch
  WebSketch().then(module => {
    const f = message.data.fileObject;
    module.FS.mkdir('/working');
    module.FS.mount(module.FS.filesystems.WORKERFS, { files: [f] }, '/working');
    const sketch = module.sketch('/working/' + f.name, 14, 29, 3, 14, 156, false, true)
    postMessage({ hash: message.data.hash, type: 'sketch', result: sketch});
  });

};
