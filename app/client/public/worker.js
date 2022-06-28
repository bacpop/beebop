onmessage = function (message) {
  AMRprediction().then(module => {
    var f = message.data.fileObject;
    module.FS.mkdir('/working');
    module.FS.mount(module.FS.filesystems.WORKERFS, { files: [f] }, '/working');
    var result = module.make_prediction("/working/" + f.name);
    postMessage({ hash: message.data.hash, AMR_results: result }); //return result
  });

  WebSketch().then(module => {
    const f = message.data.fileObject;
    module.FS.mkdir('/working');
    module.FS.mount(module.FS.filesystems.WORKERFS, { files: [f] }, '/working');
    const sketch = module.sketch('/working/' + f.name, 14, 29, 3, 14, 156, false, true)
    postMessage({ hash: message.data.hash, Sketch: sketch});
  });

};

importScripts('./web_amr_prediction.js');
importScripts('./web_sketch.js');
