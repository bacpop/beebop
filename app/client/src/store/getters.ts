import { AnalysisType } from "@/types";
import { Getter, GetterTree } from "vuex";
import { RootState } from "@/store/state";

export enum BeebopGetter {
  analysisProgress = "analysisProgress",
  uniqueClusters = "uniqueClusters"
}

export interface BeebopGetters {
  [BeebopGetter.analysisProgress]: Getter<RootState, RootState>
}

export const getters: BeebopGetters & GetterTree<RootState, RootState> = {
    [BeebopGetter.analysisProgress]: (
        state: RootState
    ): Record<string, number> => {
        let finished = 0;
        const total = Object.keys(state.analysisStatus).length;
        Object.keys(state.analysisStatus).forEach((element: string) => {
            if (state.analysisStatus[element as AnalysisType] === "finished") {
                finished += 1;
            }
        });
        return { total, finished, progress: (finished / total) };
    },

    [BeebopGetter.uniqueClusters]: (
        state: RootState
    ): number[] => {
        const clusters: number[] = [];
        Object.keys(state.results.perIsolate).forEach((element: string) => {
            clusters.push(state.results.perIsolate[element].cluster as number);
        });
        return [...new Set(clusters)].sort((a, b) => a - b);
    }
};
