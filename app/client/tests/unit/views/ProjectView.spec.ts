import { mount } from "@vue/test-utils";
import ProjectView from "@/views/ProjectView.vue";
import Vuex, { Store } from "vuex";
import { RootState } from "@/store/state";
import LoadingProject from "@/components/projects/LoadingProject.vue";
import StartButton from "@/components/StartButton.vue";
import ResultsTable from "@/components/ResultsTable.vue";
import EditProjectName from "@/components/projects/EditProjectName.vue";
import { mockRootState } from "../../mocks";

describe("Project", () => {
    const getUser = jest.fn();
    const mockRouter = {
        push: jest.fn()
    };

    const user = {
        name: "Jane",
        id: "543653d45",
        provider: "google"
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    const getWrapper = (store: Store<RootState>) => {
        return mount(ProjectView, {
            global: {
                plugins: [store],
                mocks: {
                    $router: mockRouter
                }
            }
        });
    };

    it("displays as expected, gets user information on mount", () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                projectName: "test project",
                projectId: "ABC-123",
                user
            }),
            actions: {
                getUser
            }
        });
        const wrapper = getWrapper(store);

        expect(wrapper.find("h2").text()).toBe("Project: test project");
        expect(wrapper.findComponent(EditProjectName).props()).toStrictEqual({
            projectId: "ABC-123",
            projectName: "test project",
            buttonClass: "btn-standard"
        });
        expect(wrapper.findAll(".dropzone-component").length).toBe(1);

        expect(wrapper.findComponent(StartButton).exists()).toBe(true);
        expect(wrapper.findComponent(ResultsTable).exists()).toBe(true);
        expect(getUser).toHaveBeenCalled();
        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it("after submission  dropzone disappears, now has progress bar and table and network tabs + panes ", () => {
        const uniqueClusters = jest.fn().mockReturnValue([3, 7]);

        const analysisProgress = jest.fn().mockReturnValue({
            finished: 1,
            progress: 0.3333333333333333,
            total: 3
        });

        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                projectName: "testProject",
                projectId: "ABC-123",
                user,
                submitted: true,
                analysisStatus: {
                    assign: "finished",
                    microreact: "finished",
                    network: "finished"
                },
                results: {
                    perIsolate: {
                        hash1: {
                            hash: "hash1",
                            filename: "example1.fa",
                            sketch: "sketch",
                            cluster: 7,
                            amr: {
                                filename: "example1.fa",
                                Penicillin: 0.892,
                                Chloramphenicol: 0.39,
                                Erythromycin: 0.151,
                                Tetracycline: 0.453,
                                Trim_sulfa: 0.974
                            }
                        },
                        hash2: {
                            hash: "hash2",
                            filename: "example2.fa",
                            sketch: "sketch",
                            cluster: 3,
                            amr: {
                                filename: "example2.fa",
                                Penicillin: 0.892,
                                Chloramphenicol: 0.39,
                                Erythromycin: 0.151,
                                Tetracycline: 0.453,
                                Trim_sulfa: 0.974
                            }
                        },
                        hash3: {
                            hash: "hash3",
                            filename: "example3.fa",
                            sketch: "sketch",
                            cluster: 7,
                            amr: {
                                filename: "example3.fa",
                                Penicillin: 0.892,
                                Chloramphenicol: 0.39,
                                Erythromycin: 0.151,
                                Tetracycline: 0.453,
                                Trim_sulfa: 0.974
                            }
                        }
                    },
                    perCluster: {}
                }
            }),
            actions: {
                getUser
            },
            getters: {
                analysisProgress,
                uniqueClusters
            }
        });
        const wrapper = getWrapper(store);

        expect(wrapper.findAll(".dropzone-component").length).toBe(0);
        expect(wrapper.findAll(".progress-bar-component").length).toBe(1);
        const tabs = wrapper.findAll(".nav-link");
        expect(tabs.length).toBe(2);
        expect(tabs[0].text()).toBe("Table");
        expect(tabs[1].text()).toBe("Network");
        expect(wrapper.findAll(".tab-pane").length).toBe(2);
        expect(wrapper.vm.selectedTab).toBe("table");
        tabs[1].trigger("click");
        expect(wrapper.vm.selectedTab).toBe("network");
        expect(wrapper.findComponent(LoadingProject).exists()).toBe(false);
    });

    it("redirects to root if no project name", () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                projectId: "ABC-123",
                projectName: null,
                user
            }),
            actions: {
                getUser
            }
        });
        getWrapper(store);

        expect(getUser).not.toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledTimes(1);
        expect(mockRouter.push.mock.calls[0][0]).toBe("/");
    });

    it("displays loading project component if no project id", () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                projectId: null,
                projectName: "test",
                user
            }),
            actions: {
                getUser
            }
        });
        const wrapper = getWrapper(store);

        expect(wrapper.find("div.router").exists()).toBe(false);
        expect(wrapper.findComponent(LoadingProject).exists()).toBe(true);
    });

    it("displays loading project component if project is loading", () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                projectId: "123",
                loadingProject: true,
                projectName: "test",
                user
            }),
            actions: {
                getUser
            }
        });
        const wrapper = getWrapper(store);

        expect(wrapper.find("div.router").exists()).toBe(false);
        expect(wrapper.findComponent(LoadingProject).exists()).toBe(true);
    });
});
