<template>
  <div>
      <div id='cy' ref="cy"></div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import cytoscape from 'cytoscape';
import graphml from 'cytoscape-graphml';
import jquery from 'jquery';
import { mapState, mapActions } from 'vuex';
import { CyGraphml } from '../types';

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
      const { graph } : {graph : string} = this.results.perCluster[this.cluster];
      const cy = cytoscape({
        container: this.$refs.cy as HTMLElement,
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
            },
          },
          {
            selector: 'node[ref_query = "query"]',
            style: {
              'border-color': 'red',
              'border-width': '2px',
            },
          },
          {
            selector: 'node[ref_query = "ref"]',
            style: {
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
        (cy as CyGraphml).graphml({ layoutBy: 'cose' });
        (cy as CyGraphml).graphml(graph);
      });
    },
  },
});
</script>
