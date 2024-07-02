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
        const apiSample = apiData
          ? apiData.samples.find((s) => s.hash === sample.hash)
          : null;
        const { amr, sketch } = await store.getSample(
          projectId,
          sample.hash,
          sample.filename
        );
        return {
          ...apiSample,
          ...sample,
          amr,
          sketch,
        };
      })
    );
  }
}
