import ResultsTable from "@/components/ResultsTable.vue";
import { mount } from "@vue/test-utils";
import { RootState } from "@/store/state";
import Vuex from "vuex";
import { mockRootState } from "../../mocks";

describe("empty ResultsTable", () => {
    const store = new Vuex.Store<RootState>({
        state: mockRootState({
            results: {
                perIsolate: {},
                perCluster: {}
            }
        })
    });
    const wrapper = mount(ResultsTable, {
        global: {
            plugins: [store]
        }
    });

    test("empty table message is displayed", () => {
        expect(wrapper.find("div#no-results").text()).toBe("No data uploaded yet");
        expect(wrapper.find("table").exists()).toBe(false);
    });
});

describe("ResultsTable complete", () => {
    const mockTooltipText = "Probability of resistance to:<br/>"
        + "Penicillin: Very good chance <small>(0.892)</small><br/>"
        + "Chloramphenicol: Highly unlikely <small>(0.39)</small><br/>"
        + "Erythromycin: Highly unlikely <small>(0.151)</small><br/>"
        + "Tetracycline: Highly unlikely <small>(0.453)</small><br/>"
        + "Cotrim: Almost certainly <small>(0.974)</small>";
    const store = new Vuex.Store<RootState>({
        state: mockRootState({
            user: {
                name: "Jane",
                id: "543653d45",
                provider: "google"
            },
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
        })
    });
    const wrapper = mount(ResultsTable, {
        global: {
            plugins: [store]
        }

    });

    test("does a wrapper exist", () => {
        expect(wrapper.exists()).toBe(true);
    });

    test("tableData generates table data", () => {
        const expectedTable = [
            {
                Hash: "hash2",
                Filename: "example2.fa",
                Sketch: "\u2714",
                AMR: {
                    filename: "example2.fa",
                    Penicillin: 0.892,
                    Chloramphenicol: 0.39,
                    Erythromycin: 0.151,
                    Tetracycline: 0.453,
                    Trim_sulfa: 0.974
                },
                Cluster: 3,
                Microreact: "showButton",
                Network: "showButton",
                Rowspan: 1
            },
            {
                Hash: "hash1",
                Filename: "example1.fa",
                Sketch: "\u2714",
                AMR: {
                    filename: "example1.fa",
                    Penicillin: 0.892,
                    Chloramphenicol: 0.39,
                    Erythromycin: 0.151,
                    Tetracycline: 0.453,
                    Trim_sulfa: 0.974
                },
                Cluster: 7,
                Microreact: "showButton",
                Network: "showButton",
                Rowspan: 2
            },
            {
                Hash: "hash3",
                Filename: "example3.fa",
                Sketch: "\u2714",
                AMR: {
                    filename: "example3.fa",
                    Penicillin: 0.892,
                    Chloramphenicol: 0.39,
                    Erythromycin: 0.151,
                    Tetracycline: 0.453,
                    Trim_sulfa: 0.974
                },
                Cluster: 7,
                Microreact: "showButton",
                Network: "showButton",
                Rowspan: 0
            }
        ];
        expect(wrapper.vm.tableData).toEqual(expectedTable);
    });

    test("getTooltipText generates tooltip text", () => {
        const mockAMR = {
            Penicillin: 0.892,
            Chloramphenicol: 0.39,
            Erythromycin: 0.151,
            Tetracycline: 0.453,
            Trim_sulfa: 0.974
        };
        expect(wrapper.vm.getTooltipText(mockAMR)).toBe(mockTooltipText);
    });

    test("results are displayed in the table", () => {
    // 6 headers exist
        const headers = wrapper.findAll("th");
        expect(headers.length).toBe(6);
        // 3 rows exist
        const rows = wrapper.findAll("tr");
        expect(rows.length).toBe(3);
        // 16 cells exist (3x6 minus two merged cells)
        const cells = wrapper.findAll("td");
        expect(cells.length).toBe(16);
        // first cell in each row displays filenames
        expect(cells[0].text()).toBe("example2.fa");
        expect(cells[6].text()).toBe("example1.fa");
        expect(cells[12].text()).toBe("example3.fa");
        // microreact & network cells from same cluster are merged
        expect(cells[10].attributes("rowspan")).toBe("2");
        expect(cells[11].attributes("rowspan")).toBe("2");
        // AMR cells have tooltip
        const amrCells = wrapper.findAll("span");
        expect(amrCells.length).toBe(3);
        expect(amrCells[0].attributes("data-bs-original-title")).toBe(mockTooltipText);
    });
});

describe("ResultsTable incomplete before webworker is ready", () => {
    const store = new Vuex.Store<RootState>({
        state: mockRootState({
            user: {
                name: "Jane",
                id: "543653d45",
                provider: "google"
            },
            submitted: false,
            analysisStatus: {
                assign: null,
                microreact: null,
                network: null
            },
            results: {
                perIsolate: {
                    hash1: {
                        hash: "hash1",
                        filename: "example1.fa"
                    },
                    hash2: {
                        hash: "hash2",
                        filename: "example2.fa"
                    },
                    hash3: {
                        hash: "hash3",
                        filename: "example3.fa"
                    }
                },
                perCluster: {}
            }
        })
    });
    const wrapper = mount(ResultsTable, {
        global: {
            plugins: [store]
        }

    });

    test("filenames are displayed in the table", () => {
        const cells = wrapper.findAll("td");
        // cells not yet merged
        expect(cells.length).toBe(9);
        // filenames not yet sorted by cluster
        expect(cells[0].text()).toBe("example1.fa");
        expect(cells[3].text()).toBe("example2.fa");
        expect(cells[6].text()).toBe("example3.fa");
    });

    test("sketch and AMR columns show processing", () => {
        const cells = wrapper.findAll("td");
        expect(cells[1].text()).toBe("processing");
        expect(cells[4].text()).toBe("processing");
        expect(cells[7].text()).toBe("processing");
        expect(cells[2].text()).toBe("processing");
        expect(cells[5].text()).toBe("processing");
        expect(cells[8].text()).toBe("processing");
    });
});

describe("ResultsTable incomplete after submission", () => {
    const store = new Vuex.Store<RootState>({
        state: mockRootState({
            user: {
                name: "Jane",
                id: "543653d45",
                provider: "google"
            },
            submitted: true,
            analysisStatus: {
                assign: "started",
                microreact: "waiting",
                network: "waiting"
            },
            results: {
                perIsolate: {
                    hash1: {
                        hash: "hash1",
                        filename: "example1.fa",
                        sketch: "sketch",
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
        })
    });
    const wrapper = mount(ResultsTable, {
        global: {
            plugins: [store]
        }

    });

    test("results are displayed in the table", () => {
        const cells = wrapper.findAll("td");
        // cells not yet merged
        expect(cells.length).toBe(18);
        // filenames not yet sorted by cluster
        expect(cells[0].text()).toBe("example1.fa");
        expect(cells[6].text()).toBe("example2.fa");
        expect(cells[12].text()).toBe("example3.fa");
        // cluster, microreact and network cells show analysis status
        expect(cells[3].text()).toBe("started");
        expect(cells[4].text()).toBe("waiting");
        expect(cells[5].text()).toBe("waiting");
    });
});
