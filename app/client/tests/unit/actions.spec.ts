import actions from "@/store/actions";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import config from '../../src/resources/config.json';
const { version_info } = require('../../../server/routes/routes');

describe("Actions", () => {
    const mock = new MockAdapter(axios);

    mock.onGet(`${config.app_url}/version`).reply(200, version_info);

    it("getVersions", async () => {
        const commit = jest.fn()
        await actions.getVersions({ commit })

        expect(commit).toHaveBeenCalledWith(
            "setVersions",
            version_info)
    })
})