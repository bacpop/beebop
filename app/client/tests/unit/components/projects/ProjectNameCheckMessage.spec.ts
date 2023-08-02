import { ProjectNameCheckResult } from "@/types";
import { mount } from "@vue/test-utils";
import ProjectNameCheckMessage from "@/components/projects/ProjectNameCheckMessage.vue";

describe("ProjectNameCheckMessage", () => {
    const getWrapper = (checkResult: ProjectNameCheckResult) => {
        return mount(ProjectNameCheckMessage, { props: { checkResult } });
    };

    it("renders as expected", () => {
        let wrapper = getWrapper(ProjectNameCheckResult.OK);
        expect(wrapper.text()).toBe("");
        wrapper = getWrapper(ProjectNameCheckResult.Unchanged);
        expect(wrapper.text()).toBe("");
        wrapper = getWrapper(ProjectNameCheckResult.Empty);
        expect(wrapper.text()).toBe("Name cannot be empty");
        wrapper = getWrapper(ProjectNameCheckResult.Duplicate);
        expect(wrapper.text()).toBe("Name already exists");
    });
});
