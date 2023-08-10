import { AnalysisType, ProjectNameCheckResult } from "@/types";
import { Getter, GetterTree } from "vuex";
import { RootState } from "@/store/state";

export enum BeebopGetter {
  analysisProgress = "analysisProgress",
  uniqueClusters = "uniqueClusters",
  checkProjectName = "checkProjectName"
}

export interface BeebopGetters {
  [BeebopGetter.analysisProgress]: Getter<RootState, RootState>,
  [BeebopGetter.checkProjectName]: Getter<RootState, RootState>
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
    },

    [BeebopGetter.checkProjectName]: (
        state: RootState
    ): ((name: string, oldName?: string) => ProjectNameCheckResult) => {
        return (name: string, oldName?: string) => {
            if (name.trim() === "") {
                return ProjectNameCheckResult.Empty;
            }
            if (oldName && oldName === name) {
                return ProjectNameCheckResult.Unchanged;
            }
            if (state.savedProjects.find((p) => p.name === name)) {
                return ProjectNameCheckResult.Duplicate;
            }
            return ProjectNameCheckResult.OK;
        };
    }
};
