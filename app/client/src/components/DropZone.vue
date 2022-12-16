<template>
  <div>
    <div v-bind='getRootProps()' class=dropzone>
      <input v-bind='getInputProps()' />
      <p v-if='isDragActive' class="dropzone-text">Drop the files here ...</p>
      <p v-else class="dropzone-text">Drag and drop your fasta files here,
        or click to select files</p>
    </div>
    <p class="count"> Uploaded files: {{ Object.keys(results.perIsolate).length }}</p>
  </div>
</template>

<script>
import { useDropzone } from 'vue3-dropzone';
import { useActions, useState } from 'vuex-composition-helpers';

export default {
  name: 'DropZone',
  setup() {
    const { processFiles } = useActions(['processFiles']);
    const { results } = useState(['results']);
    function onDrop(acceptFiles) {
      processFiles(acceptFiles);
    }
    const {
      getRootProps, getInputProps, isDragActive, ...rest
    } = useDropzone({ onDrop, accept: ['.fa', '.fasta'] });
    return {
      getRootProps,
      getInputProps,
      isDragActive,
      onDrop,
      results,
      ...rest,
    };
  },
};
</script>
