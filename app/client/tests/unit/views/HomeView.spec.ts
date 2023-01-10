import { mount } from "@vue/test-utils";
import HomeView from "@/views/HomeView.vue";
import Vuex from "vuex";
import { RootState } from "@/store/state";
import { mockRootState } from "../../mocks";

describe("Home", () => {
    const getUser = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("calls getUser", () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                user: null
            }),
            actions: {
                getUser
            }
        });
        mount(HomeView, {
            global: {
                plugins: [store]
            }
        });
        expect(getUser).toHaveBeenCalled();
    });

    it("shows login buttons when not logged in", () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                user: null
            }),
            actions: {
                getUser
            }
        });
        const wrapper = mount(HomeView, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("h1").text()).toMatch("Welcome to beebop!");
        const socialButtons = wrapper.findAll(".btn-social");
        expect(socialButtons.length).toBe(2);
        expect(socialButtons[0].text()).toBe("Login with Google");
        expect(socialButtons[1].text()).toBe("Login with Github");
    });

    it("shows create project controls when logged in", () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                user: {
                    name: "Jane",
                    id: "543653d45",
                    provider: "google"
                },
                results: {
                    perIsolate: {},
                    perCluster: {}
                }
            }),
            actions: {
                getUser
            }
        });
        const wrapper = mount(HomeView, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("input#create-project-name").exists()).toBe(true);
        expect(wrapper.find("button#create-project-btn").exists()).toBe(true);
    });
});
