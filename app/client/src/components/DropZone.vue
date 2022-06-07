<template>
  <div>
    <div v-bind='getRootProps()' class=dropzone>
      <input v-bind='getInputProps()' />
      <p v-if='isDragActive'>Drop the files here ...</p>
      <p v-else>Drag 'n' drop your fasta files here, or click to select files</p>
    </div>
  </div>
</template>

<script>
import { useDropzone } from 'vue3-dropzone';
import { mapMutations } from 'vuex';
import { useMutations } from 'vuex-composition-helpers';
import { Md5 } from 'ts-md5/dist/md5';

export default {
  name: 'DropZone',
  methods: {
    ...mapMutations([
      'setSketch',
    ]),
  },
  setup() {
    const { setSketch, addFile, setAMR } = useMutations({
      setSketch: 'setSketch',
      addFile: 'addFile',
      setAMR: 'setAMR',
    });
    function readContent(file) {
      return file.text();
    }
    function onDrop(acceptFiles, rejectReasons) {
      // eslint-disable-next-line
      console.log(rejectReasons)
      acceptFiles.forEach((file) => {
        readContent(file)
          .then((content) => {
            const fileHash = Md5.hashStr(content);
            const worker = new Worker('./worker.js');
            addFile({ hash: fileHash, name: file.name });
            worker.postMessage({ hash: fileHash, fileObject: file });
            worker.onmessage = (event) => {
              // put data in store
              if (event.data.Sketch) {
                setSketch(event.data);
              } else if (event.data.AMR_results) {
                setAMR(event.data);
              }
            };
          });
      });
    }

    const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop, accept: ['.fa', '.fasta'] });

    return {
      getRootProps,
      getInputProps,
      ...rest,
    };
  },

};
</script>

<style>
  .dropzone{
    border: 2px dotted rgb(56, 55, 55);
    width: 1000px;
    height: 100px;
    line-height: 100px;
    border-radius: 4px;
    background-color: rgb(159, 176, 190);
    margin: 20px auto 20px auto;
    text-align: center;

  }
</style>
