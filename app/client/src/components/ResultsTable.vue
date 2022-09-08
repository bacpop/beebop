<template>
  <div>
    <table class="table">
      <thead>
        <th>Filename</th>
        <th>Sketch</th>
        <th>AMR</th>
        <th>Cluster</th>
        <th>Microreact</th>
        <th>Network</th>
      </thead>
      <tbody v-if="tableData">
        <tr v-for="sample in tableData" :key="sample.Filename">
          <td>{{sample.Filename}}</td>
          <td :class="(sample.Sketch === '\u2714') ? 'checkmark' : 'processing'">
            {{(sample.Sketch === '\u2714') ? sample.Sketch : 'processing'}}
          </td>
          <td v-if="sample.AMR === 'processing'" class="processing">{{sample.AMR}}</td>
          <td v-else>
            <span v-b-tooltip.hover :title="getTooltipText(sample.AMR)">
              <b :style="{color: getRGB(sample.AMR.Penicillin, 'Penicillin')}">P</b>
              <b :style="{color: getRGB(sample.AMR.Chloramphenicol, 'Chloramphenicol')}">C</b>
              <b :style="{color: getRGB(sample.AMR.Erythromycin, 'Erythromycin')}">E</b>
              <b :style="{color: getRGB(sample.AMR.Tetracycline, 'Tetracycline')}">T<sub>E
              </sub></b>
              <b :style="{color: getRGB(sample.AMR.Trim_sulfa, 'Cotrim')}">S<sub>XT</sub></b>
            </span>
          </td>
          <td :class="(typeof sample.Cluster === 'number') ? '' : 'processing'">
            {{sample.Cluster}}
          </td>
          <td v-if="sample.Rowspan !== 0"
          style="vertical-align : middle;"
          :rowspan="sample.Rowspan"
          :class="(sample.Microreact === '\u2714')? 'checkmark' : 'processing'">
            {{sample.Microreact}}
          </td>
          <td v-if="sample.Rowspan !== 0"
          style="vertical-align : middle;"
          :rowspan="sample.Rowspan"
          :class="(sample.Network === '\u2714') ? 'checkmark' : 'processing'">
            {{sample.Network}}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { VBTooltip } from 'bootstrap-vue-3';
import {
  addRowspan, getRGB, tooltipLine,
} from '../utils';

export default defineComponent({
  name: 'ResultsTable',
  directives: {
    'b-tooltip': VBTooltip,
  },
  methods: {
    getRGB,
    tooltipLine,
    getTooltipText(data: Record<string, number>) {
      const firstLine = 'Probability of resistance to:';
      const pen = this.tooltipLine('Penicillin', data.Penicillin);
      const chlor = this.tooltipLine('Chloramphenicol', data.Chloramphenicol);
      const ery = this.tooltipLine('Erythromycin', data.Erythromycin);
      const tetra = this.tooltipLine('Tetracycline', data.Tetracycline);
      const cotrim = this.tooltipLine('Cotrim', data.Trim_sulfa);
      return [firstLine, pen, chlor, ery, tetra, cotrim].join('<br/>');
    },
    getCluster(sample: string) {
      return (this.results.perIsolate[sample].cluster
        ? this.results.perIsolate[sample].cluster : this.analysisStatus.assign);
    },
    getMicroreact() {
      return (this.analysisStatus.microreact === 'finished') ? '\u2714' : this.analysisStatus.microreact;
    },
    getNetwork() {
      return (this.analysisStatus.network === 'finished') ? '\u2714' : this.analysisStatus.network;
    },
  },
  computed: {
    ...mapState(['results', 'submitStatus', 'analysisStatus']),
    tableData() {
      const samples = this.results.perIsolate;
      const items: Array<Record<string, string>> = [];
      Object.keys(samples).forEach((sample) => {
        items.push({
          Hash: samples[sample].hash,
          Filename: samples[sample].filename,
          Sketch: (samples[sample].sketch) ? '\u2714' : 'processing',
          AMR: samples[sample].amr ? samples[sample].amr : 'processing',
          Cluster: this.submitStatus === 'submitted' ? this.getCluster(sample) : '',
          Microreact: this.submitStatus === 'submitted' ? this.getMicroreact() : '',
          Network: this.submitStatus === 'submitted' ? this.getNetwork() : '',
        });
      });
      const tableSorted = items.sort((a, b) => Number(a.Cluster) - Number(b.Cluster));
      if (this.analysisStatus.assign === 'finished') {
        // adding a rowspan property to merge microreact/ network cells from same cluster
        const tableRowspan = addRowspan(tableSorted);
        return tableRowspan;
      }
      return tableSorted;
    },
  },
});
</script>
