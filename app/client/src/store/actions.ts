import axios from "axios";
import { ActionContext } from "vuex";
import config from "@settings/config";
import { Md5 } from "ts-md5/dist/md5";
import { RootState } from "@/store/state";
import {
    Versions,
    User,
    AnalysisStatus,
    ClusterInfo,
    Dict,
    SavedProject,
    NewProjectRequest,
    ProjectResponse,
    IsolateValue, ValueTypes, AMR
} from "@/types";
import { api } from "@/apiService";
import { emptyState } from "@/utils";

axios.defaults.withCredentials = true;
const serverUrl = config.serverUrl();

export default {
    async getVersions(context: ActionContext<RootState, RootState>) {
        await api(context)
            .withSuccess("setVersions")
            .withError("addError")
            .get<Versions>(`${serverUrl}/version`);
    },
    async getUser(context: ActionContext<RootState, RootState>) {
        await api(context)
            .withSuccess("setUser")
            .withError("addError")
            .get<User>(`${serverUrl}/user`);
    },
    async newProject(context: ActionContext<RootState, RootState>, name: string) {
        const { commit, state } = context;
        // We assume that the latest current project state has been persisted so we can immediately use empty state for
        // new project
        Object.assign(state, emptyState());

        commit("setProjectName", name);
        await api(context)
            .withSuccess("setProjectId")
            .withError("addError")
            .post<NewProjectRequest>(`${serverUrl}/project`, { name });
    },
    async getSavedProjects(context: ActionContext<RootState, RootState>) {
        await api(context)
            .withSuccess("setSavedProjects")
            .withError("addError")
            .get<SavedProject[]>(`${serverUrl}/projects`);
    },
    async loadProject(context: ActionContext<RootState, RootState>, project: SavedProject) {
        const { commit, state } = context;
        commit("setLoadingProject", true);
        commit("addLoadingProjectMessage", "Clearing state");
        Object.assign(state, {
            ...emptyState(),
            loadingProject: true,
            projectId: project.id,
            projectHash: project.hash,
            projectName: project.name
        });
        commit("addLoadingProjectMessage", "Fetching sketches");
        await api(context)
            .withSuccess("projectLoaded")
            .withError("addError")
            .get<ProjectResponse>(`${serverUrl}/project/${project.hash}`);
        commit("addLoadingProjectMessage", "Loading complete");
        // we may need to change this to happen later when other loading steps are implemented
        commit("setLoadingProject", false);
    },
    async logoutUser() {
        await axios.get(`${serverUrl}/logout`);
    },
    async processFiles(context: ActionContext<RootState, RootState>, acceptFiles: Array<File>) {
        const { commit, dispatch } = context;
        function readContent(file: File) {
            return file.text();
        }
        acceptFiles.forEach((file: File) => {
            readContent(file)
                .then((content: string) => {
                    const fileHash = Md5.hashStr(content);
                    commit("addFile", { hash: fileHash, name: file.name });
                    const worker = new Worker("./worker.js");
                    worker.onmessage = (event) => {
                        commit("setIsolateValue", event.data);
                        if (event.data.type === ValueTypes.AMR) {
                            dispatch("postAMR", event.data);
                        }
                    };
                    worker.postMessage({ hash: fileHash, fileObject: file });
                });
        });
    },
    async runPoppunk(context: ActionContext<RootState, RootState>) {
        const { state, commit } = context;
        // generate filenameMapping that the backend can use to replace
        // filehashes with filenames in results.
        // Also generate a string of ordered hashes and corresponding filenames
        // to be used to generate a projecthash that is unique to this combination
        // of file contents and filenames
        const filenameMapping = {} as Dict<string>;
        let mappingOrdered = "";
        Object.keys(state.results.perIsolate).sort().forEach((filehash) => {
            // disabling this rule here since this should always have a value
            // since the action can only be triggered when files have been uploaded:
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            filenameMapping[filehash] = state.results.perIsolate[filehash].filename!;
            mappingOrdered += filehash;
            mappingOrdered += state.results.perIsolate[filehash].filename;
        });
        const phash = Md5.hashStr(mappingOrdered);
        commit("setProjectHash", phash);
        // add all sketches to object
        const jsonSketches = {} as Dict<Dict<string>>;
        Object.keys(state.results.perIsolate).forEach((element) => {
            jsonSketches[element] = JSON.parse(state.results.perIsolate[element].sketch as string);
        });
        const response = await api(context)
            .withError("addError")
            .ignoreSuccess()
            .post<AnalysisStatus>(`${serverUrl}/poppunk`, {
                projectHash: phash,
                projectId: state.projectId,
                sketches: jsonSketches,
                names: filenameMapping
            });
        if (response) {
            commit("setAnalysisStatus", { assign: "submitted", microreact: "submitted", network: "submitted" });
        }
    },
    async getStatus(context: ActionContext<RootState, RootState>) {
        const { state, dispatch } = context;
        const prevAssign = state.analysisStatus.assign;
        const response = await api(context)
            .withSuccess("setAnalysisStatus")
            .withError("addError")
            .post<AnalysisStatus>(`${serverUrl}/status`, { hash: state.projectHash });
        if (response) {
            if (response.data.assign === "finished" && prevAssign !== "finished") {
                dispatch("getAssignResult");
            }
            if ((response.data.network === "finished" || response.data.network === "failed")
        && (response.data.microreact === "finished" || response.data.microreact === "failed")) {
                clearInterval(state.statusInterval);
            }
        }
        if (!response) {
            clearInterval(state.statusInterval);
        }
    },
    async getAssignResult(context: ActionContext<RootState, RootState>) {
        const { state } = context;
        await api(context)
            .withSuccess("setClusters")
            .withError("addError")
            .post<ClusterInfo>(`${serverUrl}/assignResult`, { projectHash: state.projectHash });
    },
    async startStatusPolling(context: ActionContext<RootState, RootState>) {
        const { dispatch, commit } = context;
        const inter = setInterval(() => { dispatch("getStatus"); }, 1000);
        commit("setStatusInterval", inter);
    },
    async submitData(context: ActionContext<RootState, RootState>) {
        const { dispatch, commit } = context;
        await dispatch("runPoppunk");
        commit("setSubmitStatus", "submitted");
        dispatch("startStatusPolling");
    },
    async getZip(
        context: ActionContext<RootState, RootState>,
        data: Record<string, string | number>
    ) {
        const { state } = context;
        await axios.post(
            `${serverUrl}/downloadZip`,
            {
                type: data.type,
                cluster: data.cluster,
                projectHash: state.projectHash
            },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                responseType: "arraybuffer"
            }
        )
            .then((response) => {
                const blob = new Blob([response.data], { type: "application/zip" });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `${data.type}_cluster${data.cluster}.zip`;
                link.click();
            });
    },
    async buildMicroreactURL(
        context: ActionContext<RootState, RootState>,
        data: Record<string, string | number>
    ) {
        const { state, commit } = context;
        commit("setToken", data.token);
        await api(context)
            .withSuccess("addMicroreactURL")
            .withError("addError")
            .post<ClusterInfo>(`${serverUrl}/microreactURL`, {
                cluster: data.cluster,
                projectHash: state.projectHash,
                apiToken: state.microreactToken
            });
    },
    async getGraphml(
        context: ActionContext<RootState, RootState>,
        cluster: string | number
    ) {
        const { state } = context;
        await api(context)
            .withSuccess("addGraphml")
            .withError("addError")
            .post<ClusterInfo>(`${serverUrl}/downloadGraphml`, {
                cluster,
                projectHash: state.projectHash
            });
    },
    async postAMR(context: ActionContext<RootState, RootState>, amrData: IsolateValue) {
        const { state } = context;
        const sampleHash = amrData.hash;
        const amr = JSON.parse(amrData.result);
        const url = `${serverUrl}/project/${state.projectId}/amr/${sampleHash}`;
        await api(context)
            .ignoreSuccess()
            .withError("addError")
            .post<AMR>(url, amr);
    }
};
