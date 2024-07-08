import { UserStore } from "../db/userStore";
import { ProjectSample, SplitSampleId } from "../types/models";
import { APIProjectResponse } from "../types/responseTypes";

export class ProjectUtils {
  public static async getResponseSamples(
    store: UserStore,
    projectId: string,
    projectSamples: SplitSampleId[],
    apiData?: APIProjectResponse
  ): Promise<ProjectSample[]> {
    return await Promise.all(
      projectSamples.map(async (sample) => {
        const apiSample = apiData?.samples[sample.hash];
        const { amr, sketch, hasRun } = await store.getSample(
          projectId,
          sample.hash,
          sample.filename
        );
        return {
          ...apiSample,
          ...sample,
          amr,
          sketch,
          hasRun,
        };
      })
    );
  }
}
