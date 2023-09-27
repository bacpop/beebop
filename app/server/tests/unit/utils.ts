export const mockResponse = () => {
    const res: any = {};
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

export const mockRedis = {};
export const mockApp = {
    locals: {
        redis: mockRedis
    }
};

export const mockUserStoreConstructor = jest.fn();
export const mockUserProjects = [{name: "p1", hash: "123"}];
const mockProjectSamples = [
    {hash: "5678", filename: "test1.fa"},
    {hash: "1234", filename: "test2.fa"},
    {hash: "1234", filename: "test3.fa"}
];
export const mockEncryptedToken = Buffer.alloc(20, "encrypted");
export const mockUserStore = {
    saveNewProject: jest.fn().mockImplementation(() => "test-project-id"),
    getUserProjects: jest.fn().mockImplementation(() => mockUserProjects),
    getProjectHash: jest.fn().mockImplementation(() => "123"),
    saveAMR: jest.fn(),
    getProjectSamples: jest.fn().mockImplementation(() => mockProjectSamples),
    getAMR: jest.fn().mockImplementation((projectId: string, sampleHash: string, fileName: string) =>
        `AMR for ${projectId}-${sampleHash}-${fileName}`),
    renameProject: jest.fn(),
    saveProjectHash: jest.fn(),
    saveEncryptedMicroreactToken: jest.fn(),
    getEncryptedMicroreactToken: jest.fn().mockImplementation(() => mockEncryptedToken)
};
jest.mock("../../src/db/userStore", () => ({
    userStore: mockUserStoreConstructor.mockReturnValue(mockUserStore)
}));