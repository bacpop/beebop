import { RootState } from "@/store/state";
import {
    Versions, User, IsolateValue, AnalysisStatus, ClusterInfo, BeebopError, SavedProject, ProjectResponse, Isolate
} from "@/types";

export default {
    addError(state: RootState, payload: BeebopError) {
        state.errors.push(payload);
    },
    setProjectName(state: RootState, projectName: string) {
        state.projectName = projectName;
    },
    setProjectId(state: RootState, projectId: string) {
        state.projectId = projectId;
    },
    setVersions(state: RootState, versioninfo: Versions) {
        state.versions = versioninfo;
    },
    setUser(state: RootState, userinfo: User) {
        state.user = userinfo;
    },
    addFile(state: RootState, input: Record<string, string>) {
        if (!state.results.perIsolate[input.hash]) {
            state.results.perIsolate[input.hash] = {
                hash: input.hash,
                filename: input.name
            };
        }
    },
    setIsolateValue(state: RootState, input: IsolateValue) {
        let results = null;
        if (input.type === "amr") {
            results = JSON.parse(input.result);
        } else {
            results = input.result;
        }
        state.results.perIsolate[input.hash][input.type] = results;
    },
    setLoadingProject(state: RootState, value: boolean) {
        state.loadingProject = value;
        if (!value) {
            state.loadingProjectMessages = [];
        }
    },
    setProjectHash(state: RootState, phash: string) {
        state.projectHash = phash;
    },
    setSubmitStatus(state: RootState, data: string) {
        state.submitStatus = data;
    },
    setAnalysisStatus(state: RootState, data: AnalysisStatus) {
        state.analysisStatus = data;
    },
    setStatusInterval(state: RootState, interval: number) {
        state.statusInterval = interval;
    },
    setClusters(state: RootState, clusterInfo: ClusterInfo) {
        Object.keys(clusterInfo).forEach((element) => {
            state.results.perIsolate[clusterInfo[element].hash]
                .cluster = clusterInfo[element].cluster;
        });
    },
    addMicroreactURL(state: RootState, URLinfo: Record<string, string>) {
        state.results.perCluster[URLinfo.cluster] = {
            ...state.results.perCluster[URLinfo.cluster],
            cluster: URLinfo.cluster,
            microreactURL: URLinfo.url
        };
    },
    setToken(state: RootState, token: string | null) {
        state.microreactToken = token;
    },
    addGraphml(state: RootState, graphInfo: Record<string, string>) {
        state.results.perCluster[graphInfo.cluster] = {
            ...state.results.perCluster[graphInfo.cluster],
            cluster: graphInfo.cluster,
            graph: graphInfo.graph
        };
    },
    setSavedProjects(state: RootState, savedProjects: SavedProject[]) {
        state.savedProjects = savedProjects;
    },
    addLoadingProjectMessage(state: RootState, message: string) {
        state.loadingProjectMessages.push(message);
    },
    projectLoaded(state: RootState, projectResponse: ProjectResponse) {
        const samplesAsDict: Record<string, Isolate> = {};
        projectResponse.samples.forEach((sample) => {
            samplesAsDict[sample.hash!] = { ...sample, sketch: JSON.stringify(sample.sketch) };
        });
        state.results.perIsolate = samplesAsDict;
    }
};
