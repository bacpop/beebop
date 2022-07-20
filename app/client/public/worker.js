onmessage = function (message) {
  const amr_result = "AMR"
  postMessage({ hash: message.data.hash, type: 'amr', result: amr_result });
  const sketch_result = "Sketch"
  postMessage({ hash: message.data.hash, type: 'sketch', result: sketch_result }); 
};
