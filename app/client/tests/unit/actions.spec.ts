import actions from "@/store/actions";
const { version_info } = require('../../../server/routes/routes');

describe("version info", () => {
    it("get version info", async () => {
        const commit = jest.fn()
        await actions.getVersions({ commit })

        expect(commit).toHaveBeenCalledWith(
            "setVersions",
            version_info)
    })
})
