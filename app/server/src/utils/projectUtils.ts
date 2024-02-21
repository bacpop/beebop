import { UserStore } from "../db/userStore";
import { BeebopError } from "../errors/beebopError";
import { ProjectSample, SplitSampleId } from "../types/models";
import { RanProjectServer } from "../types/responseTypes";

export class ProjectUtils {
  public static async getResponseSamples(
    store: UserStore,
    projectId: string,
    projectSamples: SplitSampleId[],
    apiData?: RanProjectServer
  ): Promise<ProjectSample[]> {
    return await Promise.all(
      projectSamples.map(async (sample) => {
        const apiSample = apiData
          ? apiData.samples.find((s) => s.hash === sample.hash)
          : null;
        if (apiData && !apiSample) {
          throw new BeebopError(
            "Invalid data",
            `Sample with hash ${sample.hash} was not in API response`
          );
        }
        const { amr, sketch } = await store.getSample(
          projectId,
          sample.hash,
          sample.filename
        );
        return {
          cluster: apiSample?.cluster,
          hash: sample.hash,
          filename: sample.filename,
          amr,
          sketch,
        };
      })
    );
  }
}
