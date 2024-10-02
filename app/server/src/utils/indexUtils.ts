import { SketchKmerArguments } from "../types/responseTypes";

export class IndexUtils {
  public static convertKmersToSketchKmerArguments(
    speciesKmers: Record<string, number[]>
  ): Record<string, SketchKmerArguments> {
    return Object.entries(speciesKmers).reduce((acc, [species, kmers]) => {
        if (kmers.length < 2) {
            throw new Error(`Species ${species} has less than 2 kmers`);
        }

      const [kmerMin, kmerMax] = [kmers[0], kmers[kmers.length - 1]];
      const kmerStep = kmers[1] - kmers[0];
      acc[species] = { kmerMin, kmerMax, kmerStep };
      return acc;
    }, {} as Record<string, SketchKmerArguments>);
  }
}
