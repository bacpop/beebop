import { UserStore } from "../db/userStore";
import { BeebopError } from "../errors/beebopError";
import { SplitSampleId } from "../types/models";
import { ProjectResponse } from "../types/responseTypes";

export class ProjectUtils {
  public static async getResponseSamples(
    store: UserStore,
    projectId: string,
    projectSamples: SplitSampleId[],
    apiData?: ProjectResponse
  ) {
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
        const { amr, sketch } = await store.getSampleData(
          projectId,
          sample.hash,
          sample.filename
        );
        return {
          ...apiSample,
          hash: sample.hash,
          filename: sample.filename,
          amr,
          sketch,
        };
      })
    );
  }
}
