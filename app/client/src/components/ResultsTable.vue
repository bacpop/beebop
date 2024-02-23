<template>
  <div class="right">
    <div v-if="!tableData.length" id="no-results">
      No data uploaded yet
    </div>
    <table v-else class="table results-table">
      <thead>
        <th>Filename</th>
        <th>Sketch</th>
        <th>AMR</th>
        <template v-if="submitted">
          <th>Cluster</th>
          <th>Microreact</th>
          <th>Network</th>
        </template>
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
          <td v-if="submitted" :class="(typeof sample.Cluster === 'number') ? '' : 'processing'">
            {{sample.Cluster}}
          </td>
          <template v-if="submitted && sample.Rowspan !== 0">
            <td
            style="vertical-align : middle;"
            :rowspan="sample.Rowspan"
            :class="(sample.Microreact === 'showButton')? '' : 'processing'">
              <p v-if="(sample.Microreact !== 'showButton')">{{sample.Microreact}}</p>
              <DownloadZip
              v-if="(sample.Microreact === 'showButton')"
              :type="'microreact'"
              :cluster="sample.Cluster"/>
              <GenerateMicroreactURL
              v-if="(sample.Microreact === 'showButton')"
              :cluster="sample.Cluster"/>
            </td>
            <td v-if="submitted && sample.Rowspan !== 0"
            style="vertical-align : middle;"
            :rowspan="sample.Rowspan"
            :class="(sample.Network === 'showButton') ? '' : 'processing'">
              <p v-if="(sample.Network !== 'showButton')">{{sample.Network}}</p>
              <DownloadZip
              v-if="(sample.Network === 'showButton')"
              :type="'network'"
              :cluster="sample.Cluster"/>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { VBTooltip } from "bootstrap-vue-3";
import {
    addRowspan, getRGB, tooltipLine
} from "../utils";
import DownloadZip from "./DownloadZip.vue";
import GenerateMicroreactURL from "./GenerateMicroreactURL.vue";

export default defineComponent({
    name: "ResultsTable",
    directives: {
        "b-tooltip": VBTooltip
    },
    components: {
        DownloadZip,
        GenerateMicroreactURL
    },
    methods: {
        getRGB,
        tooltipLine,
        getTooltipText(data: Record<string, number>) {
            const firstLine = "Probability of resistance to:";
            const pen = this.tooltipLine("Penicillin", data.Penicillin);
            const chlor = this.tooltipLine("Chloramphenicol", data.Chloramphenicol);
            const ery = this.tooltipLine("Erythromycin", data.Erythromycin);
            const tetra = this.tooltipLine("Tetracycline", data.Tetracycline);
            const cotrim = this.tooltipLine("Cotrim", data.Trim_sulfa);
            return [firstLine, pen, chlor, ery, tetra, cotrim].join("<br/>");
        },
        getCluster(sample: string) {
            return (this.results.perIsolate[sample].cluster
                ? this.results.perIsolate[sample].cluster : this.analysisStatus?.assign);
        },
        getMicroreact() {
            return (this.analysisStatus?.microreact === "finished") ? "showButton" : this.analysisStatus?.microreact;
        },
        getNetwork() {
            return (this.analysisStatus?.network === "finished") ? "showButton" : this.analysisStatus?.network;
        }
    },
    computed: {
        ...mapState(["results", "submitted", "analysisStatus"]),
        tableData() {
            const samples = this.results.perIsolate;
            const items: Record<string, string | number>[] = [];
            Object.keys(samples).forEach((sample) => {
                items.push({
                    Hash: samples[sample].hash,
                    Filename: samples[sample].filename,
                    Sketch: (samples[sample].sketch) ? "\u2714" : "processing",
                    AMR: samples[sample].amr ? samples[sample].amr : "processing",
                    Cluster: this.submitted ? this.getCluster(sample) : "",
                    Microreact: this.submitted ? this.getMicroreact() : "",
                    Network: this.submitted ? this.getNetwork() : ""
                });
            });
            const tableSorted = items.sort((a, b) => Number(a.Cluster) - Number(b.Cluster));
            if (this.analysisStatus?.assign === "finished") {
                // adding a rowspan property to merge microreact/ network cells from same cluster
                const tableRowspan = addRowspan(tableSorted);
                return tableRowspan;
            }
            return tableSorted;
        }
    }
});
</script>
