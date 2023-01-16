import SelectAction from "@/components/SelectAction.vue";
import { mount, VueWrapper } from "@vue/test-utils";
import { RootState } from "@/store/state";
import Vuex from "vuex";
import SavedProjects from "@/components/SavedProjects.vue";
import { mockRootState } from "../../mocks";

describe("SelectAction", () => {
    const getUser = jest.fn();
    const setProjectName = jest.fn();
    const mockRouter = {
        push: jest.fn()
    };

    const store = new Vuex.Store<RootState>({
        state: mockRootState({
            user: {
                name: "Jane",
                id: "543653d45",
                provider: "google"
            }
        }),
        actions: {
            getUser
        },
        mutations: {
            setProjectName
        }
    });
    const getWrapper = () => mount(SelectAction, {
        global: {
            plugins: [store],
            mocks: {
                $router: mockRouter
            }
        }

    });

    let wrapper: VueWrapper;

    beforeEach(() => {
        jest.resetAllMocks();
        wrapper = getWrapper();
    });

    test("does a wrapper exist", () => {
        expect(wrapper.exists()).toBe(true);
    });

    test("gets user information on mount", () => {
        expect(getUser).toHaveBeenCalledTimes(1);
    });

    test("displays as expected", () => {
        const input = wrapper.find("input#create-project-name");
        expect(input.text()).toBe("");
        expect(input.attributes("placeholder")).toBe("Project name");
        const button = wrapper.find("button#create-project-btn");
        expect(button.text()).toBe("Create new project");
        expect((button.element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.findComponent(SavedProjects).exists()).toBe(true);
    });

    test("renders nothing when no user", () => {
        const noUserStore = new Vuex.Store<RootState>({ state: mockRootState() });
        const emptyWrapper = mount(SelectAction, {
            global: {
                plugins: [noUserStore]
            }

        });
        expect(emptyWrapper.find("div").exists()).toBe(false);
    });

    test("enter name and click button sets project name and loads project page", async () => {
        const input = wrapper.find("#create-project-name");
        await input.setValue("test name");
        const button = wrapper.find("#create-project-btn");
        expect((button.element as HTMLButtonElement).disabled).toBe(false);
        await button.trigger("click");

        expect(setProjectName).toHaveBeenCalledTimes(1);
        expect(setProjectName.mock.calls[0][1]).toBe("test name");
        expect(mockRouter.push).toHaveBeenCalledTimes(1);
        expect(mockRouter.push).toHaveBeenCalledWith("/project");
    });

    test("enter name and press enter sets project name and loads project page", async () => {
        const input = wrapper.find("#create-project-name");
        await input.setValue("test name");
        await input.trigger("keyup.enter");

        expect(setProjectName).toHaveBeenCalledTimes(1);
        expect(setProjectName.mock.calls[0][1]).toBe("test name");
        expect(mockRouter.push).toHaveBeenCalledTimes(1);
        expect(mockRouter.push).toHaveBeenCalledWith("/project");
    });

    test("pressing enter while input is empty does nothing", async () => {
        const input = wrapper.find("#create-project-name");
        await input.trigger("keyup.enter");

        expect(setProjectName).toHaveBeenCalledTimes(0);
        expect(mockRouter.push).toHaveBeenCalledTimes(0);
    });
});
