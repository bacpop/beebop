<template>
  <div>
    <div id='cy'></div>
  </div>
</template>

<script lang='ts'>
/* eslint-disable no-multi-spaces */
import { defineComponent } from 'vue';
import cytoscape from 'cytoscape';
import graphml from 'cytoscape-graphml';
import jquery from 'jquery';
import { mapState, mapActions } from 'vuex';

export default defineComponent({
  name: 'CytoscapeGraph',
  props: ['cluster'],
  mounted() {
    graphml(cytoscape, jquery);
    this.drawGraph();
  },
  computed: {
    ...mapState(['results']),
  },
  methods: {
    ...mapActions(['getGraphml']),
    async drawGraph() {
      if (!this.results.perCluster[this.cluster] || !this.results.perCluster[this.cluster].graph) {
        await this.getGraphml(this.cluster);
      }
      const { graph } = this.results.perCluster[this.cluster];
      const cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
          {
            selector: 'node',
            style: {
              width: '10px',
              height: '10px',
              content: 'data(key0)',
              'font-size': '7px',
              'background-color': 'darkblue',
              'border-style': 'solid',
              'border-color': 'black',
              'border-width': '1px',
            },
          },
          {
            selector: 'edge',
            style: {
              width: '2px',
              'line-color': 'steelblue',
            },
          },
        ],
        layout: {
          name: 'grid',
        },
      });
      cy.ready(() => {
        (cy as any).graphml({ layoutBy: 'cose' }); // eslint-disable-line @typescript-eslint/no-explicit-any
        (cy as any).graphml(graph); // eslint-disable-line @typescript-eslint/no-explicit-any
      });
    },
  },
});
</script>
