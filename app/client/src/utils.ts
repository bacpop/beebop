import { RootState } from "@/store/state";
import {SavedProject} from "@/types";
import store from "@/store";

export const emptyState = (): RootState => ({
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

export function addRowspan(tableSorted: Record<string, string | number>[]) {
    // extract cluster numbers
    const clusters = tableSorted.map((a) => a.Cluster);
    // get counts of individual clusters
    const counts = {} as Record<number | string, number>;
    clusters.forEach((num) => {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    });
    // generate list of rowspans to be added to table
    const rowspan = [] as number[];
    Object.values(counts).forEach((num) => {
        if (num === 1) {
            rowspan.push(1);
        } else {
            rowspan.push(num);
            for (let i = 0; i < (num - 1); i += 1) {
                rowspan.push(0);
            }
        }
    });
    // map rowspans to hashes
    const hashes = tableSorted.map((a) => a.Hash);
    const rowspanMap = {} as Record<string, number>;
    hashes.forEach((hash, i) => {
        rowspanMap[hash] = rowspan[i];
    });
    // add rowspans to table
    const tableRowspan = tableSorted.map((obj) => ({ ...obj, Rowspan: rowspanMap[obj.Hash] }));
    return tableRowspan;
}

export function getRGB(value: string | number, antibiotic: string) {
    // Translate probabilities into colours, depending on antibiotic
    if (value === "processing") {
        return "rgb(50, 168, 82)";
    }
    let prob = 0;
    if (antibiotic === "Penicillin" || antibiotic === "Cotrim") {
    // achieve more colourchanges towards the extremes 0&1
        prob = 0.07 * Math.log((Number(value) + 0.0008) / (1 - 0.9992 * Number(value))) + 0.499944067;
    } else if (antibiotic === "Chloramphenicol" || antibiotic === "Tetracycline") {
    // achieve more changes around .5
        prob = (Math.exp(40 * Number(value) - 20)) / (1 + Math.exp(40 * Number(value) - 20));
    } else if (antibiotic === "Erythromycin") {
        prob = Number(value);
    }
    // set targeted colours for values 0 and 1
    const target0 = { r: 196, g: 212, b: 245 };
    const target1 = { r: 2, g: 57, b: 168 };
    const r = Math.round(target0.r - (prob * (target0.r - target1.r)));
    const g = Math.round(target0.g - (prob * (target0.g - target1.g)));
    const b = Math.round(target0.b - (prob * (target0.b - target1.b)));
    return ["rgb(", r, ",", g, ",", b, ")"].join("");
}
export function verbalProb(prob: number, antibiotic: string) {
    // Translate probabilities into words, depending on antibiotic
    let word = prob.toString();
    if (antibiotic === "Penicillin") {
        if (prob >= 0.9) {
            word = "Highly likely";
        } else if (prob >= 0.75) {
            word = "Very good chance";
        } else if (prob >= 0.5) {
            word = "Probably";
        } else if (prob >= 0.4) {
            word = "Probably not";
        } else if (prob >= 0.2) {
            word = "Unlikely";
        } else if (prob < 0.2) { word = "Highly unlikely"; }
    } else if (antibiotic === "Chloramphenicol") {
        if (prob >= 0.55) {
            word = "Probably";
        } else if (prob >= 0.5) {
            word = "Unsure";
        } else if (prob < 0.5) {
            word = "Highly unlikely";
        }
    } else if (antibiotic === "Erythromycin") {
        if (prob >= 0.5) {
            word = "Almost certainly";
        } else if (prob >= 0.2) {
            word = "Probably not";
        } else if (prob < 0.2) {
            word = "Highly unlikely";
        }
    } else if (antibiotic === "Tetracycline") {
        if (prob >= 0.5) {
            word = "Almost certainly";
        } else if (prob < 0.5) {
            word = "Highly unlikely";
        }
    } else if (antibiotic === "Cotrim") {
        if (prob >= 0.8) {
            word = "Almost certainly";
        } else if (prob >= 0.7) {
            word = "Highly likely";
        } else if (prob >= 0.5) {
            word = "Very good chance";
        } else if (prob >= 0.2) {
            word = "Probably not";
        } else if (prob < 0.2) {
            word = "Unlikely";
        }
    }
    return word;
}

export function tooltipLine(name: string, num: number) {
    return `${name}: ${verbalProb(num, name)} <small>(${num})</small>`;
}
