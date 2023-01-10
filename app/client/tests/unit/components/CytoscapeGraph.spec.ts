// Mock the import of cytoscape
/* eslint-disable import/first */

const mockReady = jest.fn();
const mockGraphMl = jest.fn();
const mockCytoscape = jest.fn().mockReturnValue({
    ready: mockReady,
    graphml: mockGraphMl
});

jest.mock("cytoscape", () => mockCytoscape);
const mockCytoscapeGraphMlFunction = jest.fn();
const mockCytoscapeGraphMl = jest.fn().mockReturnValue({
    graphml: mockCytoscapeGraphMlFunction
});
jest.mock("cytoscape-graphml", () => mockCytoscapeGraphMl);

import { mount } from "@vue/test-utils";
import { RootState } from "@/store/state";
import Vuex, { Store } from "vuex";
import CytoscapeGraph from "@/components/CytoscapeGraph.vue";
import { mockRootState } from "../../mocks";

describe("CytoscapeGraph", () => {
    const getGraphml = jest.fn();

    const storeNoGraph = new Vuex.Store<RootState>({
        state: mockRootState({
            results: {
                perIsolate: {},
                perCluster: {
                    2: {
                        cluster: "2"
                    }
                }
            }
        }),
        actions: {
            getGraphml
        }
    });

    const storeWithGraph = new Vuex.Store<RootState>({
        state: mockRootState({
            results: {
                perIsolate: {},
                perCluster: {
                    2: {
                        cluster: "2",
                        graph: "<graph></graph>"
                    }
                }
            }
        }),
        actions: {
            getGraphml
        }
    });

    const getWrapper = (store: Store<RootState>) => mount(CytoscapeGraph, {
        propsData: {
            cluster: 2
        },
        global: {
            plugins: [store]
        }
    } as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("does a wrapper exist", () => {
        const wrapper = getWrapper(storeNoGraph);
        expect(wrapper.exists()).toBe(true);
    });

    test("getGraph() is called when no graph available", () => {
        getWrapper(storeNoGraph);
        expect(getGraphml).toHaveBeenCalledTimes(1);
    });

    test("cytoscape methods called as expected", () => {
        const wrapper = getWrapper(storeWithGraph);

        expect(mockCytoscape).toHaveBeenCalledTimes(1);
        const cyElement = wrapper.find("#cy").element;
        expect(mockCytoscape.mock.calls[0][0]).toStrictEqual({
            container: cyElement,
            style: [
                {
                    selector: "node",
                    style: {
                        width: "10px",
                        height: "10px",
                        content: "data(key0)",
                        "font-size": "7px",
                        "background-color": "darkblue",
                        "border-style": "solid"
                    }
                },
                {
                    selector: 'node[ref_query = "query"]',
                    style: {
                        "border-color": "red",
                        "border-width": "2px"
                    }
                },
                {
                    selector: 'node[ref_query = "ref"]',
                    style: {
                        "border-color": "black",
                        "border-width": "1px"
                    }
                },
                {
                    selector: "edge",
                    style: {
                        width: "2px",
                        "line-color": "steelblue"
                    }
                }
            ],
            layout: {
                name: "grid"
            }
        });
        expect(mockReady).toHaveBeenCalledTimes(1);

        // Expect that calling the method passed to ready as a parameter will in turn call graphml
        const readyParam = mockReady.mock.calls[0][0];
        readyParam();
        expect(mockGraphMl).toHaveBeenCalledTimes(2);
        expect(mockGraphMl.mock.calls[0][0]).toStrictEqual({ layoutBy: "cose" });
        expect(mockGraphMl.mock.calls[1][0]).toBe("<graph></graph>");
    });
});
