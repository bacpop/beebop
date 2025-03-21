import type { AMR, AMRForCsv, ProjectSample } from "@/types/projectTypes";
import { convertProbabilityToWord } from "./amrDisplayUtils";

export const downloadCsv = (samples: ProjectSample[], filename: string) => {
  const csvData = samples.map((sample) => ({
    Filename: sample.filename,
    ...(sample.amr && convertAmrForCsv(sample.amr)),
    Cluster: sample.cluster || ""
  }));

  const csvContent = generateCsvContent(csvData);
  triggerCsvDownload(csvContent, `${filename}.csv`);
};

export const convertAmrForCsv = (amr: AMR): AMRForCsv => ({
  "Penicillin Resistance": convertProbabilityToWord(amr.Penicillin, "Penicillin"),
  "Chloramphenicol Resistance": convertProbabilityToWord(amr.Chloramphenicol, "Chloramphenicol"),
  "Erythromycin Resistance": convertProbabilityToWord(amr.Erythromycin, "Erythromycin"),
  "Tetracycline Resistance": convertProbabilityToWord(amr.Tetracycline, "Tetracycline"),
  "Cotrim Resistance": convertProbabilityToWord(amr.Trim_sulfa, "Cotrim")
});

export const generateCsvContent = (data: Record<string, string>[]) => {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((header) => `"${row[header]}"`).join(","));
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
