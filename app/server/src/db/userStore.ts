import Redis from "ioredis";
import {uid} from "uid";
import {AMR, BaseProjectInfo, SplitSampleId} from "../types/models";
import {BeebopError} from "../errors/beebopError";

const BEEBOP_PREFIX = "beebop:";

export class UserStore {
    private readonly _redis: Redis;

    constructor(redis: Redis) {
        this._redis = redis;
    }

    private _userIdFromRequest = (request) => `${request.user.provider}:${request.user.id}`;
    private _userProjectsKey = (userId: string) => `${BEEBOP_PREFIX}userprojects:${userId}`;
    private _projectKey = (projectId: string) => `${BEEBOP_PREFIX}project:${projectId}`;
    private _projectSamplesKey = (projectId: string) => `${this._projectKey(projectId)}:samples`;
    private _projectSampleKey = (projectId: string, sampleId: string) => `${this._projectKey(projectId)}:sample:${sampleId}`;

    private _newProjectId = () => uid(32);
    private _sampleId = (sampleHash: string, fileName: string) => `${sampleHash}:${fileName}`;

    private async _setProjectName (projectId: string, newProjectName: string) {
        await this._validateProject(projectId);
        await this._redis.hset(this._projectKey(projectId), "name", newProjectName);
    }

    private async _validateProject(projectId: string): Promise<Record<string, unknown>> {
        const project = await this._redis.hgetall(this._projectKey(projectId));
        if (project.deletedAt) {
            throw new BeebopError('Deleted project', 'This project has been deleted', 404);
        } else {
            return project;
        }
    }

    async saveNewProject(request, projectName: string) {
        const user = this._userIdFromRequest(request);
        const projectId = this._newProjectId();
        await this._redis.lpush(this._userProjectsKey(user), projectId);
        await this._setProjectName(projectId, projectName);
        await this._redis.hset(this._projectKey(projectId), "timestamp", Date.now());
        return projectId;
    }

    async renameProject(request, projectId: string, newProjectName: string) {
        // TODO: verify that this project belongs to the request user:
        // https://mrc-ide.myjetbrains.com/youtrack/issue/bacpop-96
        await this._validateProject(projectId);
        await this._setProjectName(projectId, newProjectName);
    }

    async deleteProject(request, projectId: string) {
        // TODO: verify that this project belongs to the request user:
        // https://mrc-ide.myjetbrains.com/youtrack/issue/bacpop-96
        await this._validateProject(projectId);
        await this._redis.hset(this._projectKey(projectId), "deletedAt", Date.now());
    }

    async saveProjectHash(request, projectId: string, projectHash: string, samples: Record<string, string>) {
        // TODO: verify that this project belongs to the request user/*  */:
        // https://mrc-ide.myjetbrains.com/youtrack/issue/bacpop-96
        const multi = this._redis.multi();
        await this._validateProject(projectId);
        for (const key in samples) {
            const sampleId = this._sampleId(key, samples[key]);
            multi.hset(this._projectSampleKey(projectId, sampleId), "hasRun", 1);
        }
        multi.hset(this._projectKey(projectId), "hash", projectHash);
        await multi.exec();
    }

    async getProjectHash(request, projectId: string) {
        await this._validateProject(projectId);
        return await this._redis.hget(this._projectKey(projectId), "hash")
    }

    async getBaseProjectInfo(projectId: string): Promise<BaseProjectInfo> {
        const project = await this._validateProject(projectId);
        return project as unknown as BaseProjectInfo;
    }

    async getUserProjects(request) {
        // Get all project ids for the user
        const user = this._userIdFromRequest(request);
        const projectIdsKey = this._userProjectsKey(user);
        const projectIds = await this._redis.lrange(projectIdsKey, 0, -1);

        const result = [];
        await Promise.all(projectIds.map(async (projectId: string) => {
            const projectData = await this._redis.hgetall(this._projectKey(projectId));
            if (!projectData.deletedAt) {
                const samplesCount = await this.getProjectSampleCount(projectId);

                result.push({
                    id: projectId,
                    name: projectData.name,
                    hash: projectData.hash,
                    timestamp: parseInt(projectData.timestamp),
                    samplesCount
                });
            }
        }));

        return result;
    }

    async saveSketch(projectId: string, sampleHash: string, filename: string, sketch: Record<string,unknown> ) {
        await this._validateProject(projectId);
        const sampleId = this._sampleId(sampleHash, filename);
        await this._redis.sadd(this._projectSamplesKey(projectId), sampleId);
        await this._redis.hset(this._projectSampleKey(projectId, sampleId), "sketch", JSON.stringify(sketch));
    }

    async saveAMR(projectId: string, sampleHash: string, amr: AMR) {
        await this._validateProject(projectId);
        const sampleId = this._sampleId(sampleHash, amr.filename);
        await this._redis.sadd(this._projectSamplesKey(projectId), sampleId);
        await this._redis.hset(this._projectSampleKey(projectId, sampleId), "amr", JSON.stringify(amr));
    }

    async getSketch(projectId: string, sampleHash: string, filename: string): Promise<Record<string, unknown>> {
        await this._validateProject(projectId);
        const sampleId = this._sampleId(sampleHash, filename);
        const sketchString = await this._redis.hget(this._projectSampleKey(projectId, sampleId), "sketch");
        return JSON.parse(sketchString);
    }

    async getAMR(projectId: string, sampleHash: string, fileName: string): Promise<AMR> {
        await this._validateProject(projectId);
        const sampleId = this._sampleId(sampleHash, fileName);
        const amrString = await this._redis.hget(this._projectSampleKey(projectId, sampleId), "amr");
        return JSON.parse(amrString);
    }
    async deleteSample(projectId: string, sampleHash: string, filename: string) {
        await this._validateProject(projectId);
        const sampleId = this._sampleId(sampleHash, filename);
        await this._redis.srem(this._projectSamplesKey(projectId), sampleId);
        await this._redis.del(this._projectSampleKey(projectId, sampleId));
    }

    async getSample(projectId: string, sampleHash: string, filename: string): Promise<{ sketch: Record<string, unknown>; amr: AMR; hasRun: boolean }> {
        await this._validateProject(projectId);
        const sampleId = this._sampleId(sampleHash, filename);
        const samples = await this._redis.hgetall(this._projectSampleKey(projectId, sampleId));
        return { sketch: JSON.parse(samples.sketch), amr: JSON.parse(samples.amr), hasRun: !!samples.hasRun  };
    }

    async getProjectSplitSampleIds(projectId: string): Promise<SplitSampleId[]> {
        await this._validateProject(projectId);
        const sampleIds = await this._redis.smembers(this._projectSamplesKey(projectId));
        return sampleIds.map((sampleId) => {
            const [hash, filename] = sampleId.split(":");
            return {hash, filename};
        });
    }

    async getProjectSampleCount(projectId: string) {
        await this._validateProject(projectId);
        return this._redis.scard(this._projectSamplesKey(projectId));
    }
}

export const userStore = (redis: Redis) => new UserStore(redis);