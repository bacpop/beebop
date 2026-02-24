import type { AMR, AMRForCsv, ProjectSample, Sublineage } from "@/types/projectTypes";
import { convertProbabilityToWord } from "./amrDisplayUtils";

export const downloadCsv = (samples: ProjectSample[], filename: string) => {
  const csvData = samples.map((sample) => ({
    Filename: sample.filename,
    ...(sample.amr && convertAmrForCsv(sample.amr)),
    ...(sample.cluster && { Cluster: sample.cluster }),
    ...(sample.sublineage && constructSublineageForCsv(sample.sublineage))
  }));

  const csvContent = generateCsvContent(csvData);
  triggerCsvDownload(csvContent, `${filename}.csv`);
};

export const constructSublineageForCsv = (sublineage: Sublineage) => ({
  "Rank 50 Sublineage": sublineage.Rank_50_Lineage.toString(),
  "Rank 25 Sublineage": sublineage.Rank_25_Lineage.toString(),
  "Rank 10 Sublineage": sublineage.Rank_10_Lineage.toString(),
  "Rank 5 Sublineage": sublineage.Rank_5_Lineage.toString()
});

export const convertAmrForCsv = (amr: AMR): AMRForCsv => ({
  "Penicillin Resistance": convertProbabilityToWord(amr.Penicillin, "Penicillin"),
  "Chloramphenicol Resistance": convertProbabilityToWord(amr.Chloramphenicol, "Chloramphenicol"),
  "Erythromycin Resistance": convertProbabilityToWord(amr.Erythromycin, "Erythromycin"),
  "Tetracycline Resistance": convertProbabilityToWord(amr.Tetracycline, "Tetracycline"),
  "Cotrim Resistance": convertProbabilityToWord(amr.Trim_sulfa, "Cotrim")
});

export const generateCsvContent = (data: Record<string, string>[]) => {
  if (data.length === 0) return "";

  const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))));
  const rows = data.map((row) => headers.map((header) => `"${row[header] ?? ""}"`).join(","));
  return [headers.join(","), ...rows].join("\n");
};

export const triggerCsvDownload = (csvContent: string, filename: string) => {
  const anchor = document.createElement("a");
  anchor.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
  anchor.target = "_blank";
  anchor.download = filename;
  anchor.click();
  anchor.remove();
};
