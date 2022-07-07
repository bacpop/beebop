<template>
  <div>
    <div v-bind='getRootProps()' class=dropzone>
      <input v-bind='getInputProps()' />
      <p v-if='isDragActive'>Drop the files here ...</p>
      <p v-else>Drag and drop your fasta files here, or click to select files</p>
    </div>
    <p> Uploaded files:</p>
    <!--only adding this temporarily to have something testable for e2e tests-->
    <p v-for="file in results.perIsolate" :key="file.hash" class="uploaded-info">
      {{file.filename}} {{file.hash}}
    </p>
    <p class="count">{{uploadedFiles}}</p>
  </div>
</template>

<script>
import { useDropzone } from 'vue3-dropzone';
import { useActions, useState } from 'vuex-composition-helpers';

export default {
  name: 'DropZone',
  setup() {
    const { processFiles } = useActions(['processFiles']);
    const { results, uploadedFiles } = useState(['results', 'uploadedFiles']);
    function onDrop(acceptFiles) {
      processFiles(acceptFiles);
    }
    const { getRootProps, getInputProps, isDragActive, ...rest } = useDropzone({ onDrop, accept: ['.fa', '.fasta'] });
    return {
      getRootProps,
      getInputProps,
      isDragActive,
      onDrop,
      results,
      uploadedFiles,
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
