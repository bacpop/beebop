import Vuex from "vuex";
import { mount, shallowMount } from "@vue/test-utils";
import Vue from "vue";
import AboutView from "@/views/AboutView.vue";
import VersionInfo from '@/components/VersionInfo.vue';

describe("About", () => {
    it("renders VersionInfo", () => {
        const store = new Vuex.Store({
            state: {
                versions: {
                    "status":"success",
                    "errors":[],
                    "data":[
                        {"name":"beebop","version":"0.1.0"},
                        {"name":"poppunk","version":"2.4.0"}
                    ]
                }
            }
        });

        const wrapper = mount(AboutView, {
            store
        });
        expect(wrapper.find("h2").text()).toMatch('About');
    });
});