import {
    addRowspan, emptyState, getRGB, verbalProb
} from "../../src/utils";

describe("util functions", () => {
    const sortedTable = [
        { Hash: "abcdefg", Cluster: 4 },
        { Hash: "hijklmn", Cluster: 7 },
        { Hash: "opqrstu", Cluster: 7 },
        { Hash: "vwxyz", Cluster: 12 }
    ];
    const tableRowspan = [
        { Hash: "abcdefg", Cluster: 4, Rowspan: 1 },
        { Hash: "hijklmn", Cluster: 7, Rowspan: 2 },
        { Hash: "opqrstu", Cluster: 7, Rowspan: 0 },
        { Hash: "vwxyz", Cluster: 12, Rowspan: 1 }
    ];

    it("addRowspan adds correct rowspan to table array", () => {
        const newTable = addRowspan(sortedTable);
        expect(newTable).toEqual(tableRowspan);
    });

    it("getRGB generates right RGB", () => {
    // all extremes match target colours
        expect(getRGB(0, "Erythromycin")).toEqual("rgb(196,212,245)");
        expect(getRGB(1, "Erythromycin")).toEqual("rgb(2,57,168)");
        expect(getRGB(0, "Chloramphenicol")).toEqual("rgb(196,212,245)");
        expect(getRGB(1, "Chloramphenicol")).toEqual("rgb(2,57,168)");
        expect(getRGB(0, "Penicillin")).toEqual("rgb(196,212,245)");
        expect(getRGB(1, "Penicillin")).toEqual("rgb(2,57,168)");
        // all Antibiotics match intermediate colour at 0.5
        expect(getRGB(0.5, "Erythromycin")).toEqual("rgb(99,135,207)");
        expect(getRGB(0.5, "Chloramphenicol")).toEqual("rgb(99,135,207)");
        expect(getRGB(0.5, "Penicillin")).toEqual("rgb(99,135,207)");
        // some other values
        expect(getRGB(0.2, "Cotrim")).toEqual("rgb(118,150,214)");
        expect(getRGB(0.4, "Tetracycline")).toEqual("rgb(193,209,244)");
        expect(getRGB(0.3, "Erythromycin")).toEqual("rgb(138,166,222)");
        // processing status is grey
        expect(getRGB("processing", "Erythromycin")).toEqual("rgb(50, 168, 82)");
    });

    it("verbalProb generates right verbal representation of probability", () => {
        expect(verbalProb(1, "Penicillin")).toEqual("Highly likely");
        expect(verbalProb(0.8, "Penicillin")).toEqual("Very good chance");
        expect(verbalProb(0.6, "Penicillin")).toEqual("Probably");
        expect(verbalProb(0.45, "Penicillin")).toEqual("Probably not");
        expect(verbalProb(0.3, "Penicillin")).toEqual("Unlikely");
        expect(verbalProb(0.1, "Penicillin")).toEqual("Highly unlikely");

        expect(verbalProb(0.8, "Chloramphenicol")).toEqual("Probably");
        expect(verbalProb(0.54, "Chloramphenicol")).toEqual("Unsure");
        expect(verbalProb(0.3, "Chloramphenicol")).toEqual("Highly unlikely");

        expect(verbalProb(0.8, "Erythromycin")).toEqual("Almost certainly");
        expect(verbalProb(0.4, "Erythromycin")).toEqual("Probably not");
        expect(verbalProb(0.1, "Erythromycin")).toEqual("Highly unlikely");

        expect(verbalProb(0.6, "Tetracycline")).toEqual("Almost certainly");
        expect(verbalProb(0.4, "Tetracycline")).toEqual("Highly unlikely");

        expect(verbalProb(0.9, "Cotrim")).toEqual("Almost certainly");
        expect(verbalProb(0.75, "Cotrim")).toEqual("Highly likely");
        expect(verbalProb(0.6, "Cotrim")).toEqual("Very good chance");
        expect(verbalProb(0.4, "Cotrim")).toEqual("Probably not");
        expect(verbalProb(0.1, "Cotrim")).toEqual("Unlikely");
    });

    it("generates empty state", () => {
        const state = emptyState();
        expect(state).toStrictEqual({
            errors: [],
            versions: [],
            user: null,
            microreactToken: null,
            results: {
                perIsolate: {},
                perCluster: {}
            },
            projectName: null,
            projectId: null,
            projectHash: null,
            submitted: false,
            analysisStatus: {
                assign: null,
                microreact: null,
                network: null
            },
            statusInterval: undefined,
            savedProjects: [],
            loadingProject: false,
            loadingProjectMessages: []
        });
    });
});
