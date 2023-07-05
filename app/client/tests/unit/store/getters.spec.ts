import { getters } from "@/store/getters";
import { mockRootState } from "../../mocks";

describe("getters", () => {
    it("calculates analysisProgress", () => {
        const state = mockRootState({
            projectHash: "randomHash",
            submitted: true,
            analysisStatus: {
                assign: "finished",
                microreact: "started",
                network: "queued"
            }
        });
        expect(getters.analysisProgress(state, "analysisProgress", state, "analysisProgress")).toStrictEqual({
            finished: 1,
            progress: 0.3333333333333333,
            total: 3
        });
    });
    it("gets unique clusters", () => {
        const state = mockRootState({
            results: {
                perCluster: {},
                perIsolate: {
                    hash1: {
                        cluster: 4
                    },
                    hash2: {
                        cluster: 2
                    },
                    hash3: {
                        cluster: 7
                    },
                    hash4: {
                        cluster: 4
                    },
                    hash5: {
                        cluster: 31
                    },
                    hash6: {
                        cluster: 2
                    }
                }
            }
        });
        expect(getters.uniqueClusters(
            state,
            "uniqueClusters",
            state,
            "uniqueClusters"
        )).toStrictEqual([2, 4, 7, 31]);
    });
});
