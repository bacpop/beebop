<template>
  <span v-if="!editingProjectName">
        <slot></slot>
        <i class="bi bi-pencil edit-icon clickable"
           v-b-tooltip.hover
           title="Edit Project Name"
           @click="editProjectName"
           v-on:keyup.enter="editProjectName"
        ></i>
    </span>
    <span v-else>
        <input ref="renameProject"
               class="project-name-input"
               type="text"
               style="display:inline"
               aria-label="New project name"
               v-on:keyup.enter="saveProjectName"
               v-model="inputModel"
               />
        <button @click="saveProjectName" id="save-project-name" class="btn ms-2" :class="buttonClass" :disabled="!canSave">
            Save
        </button>
        <button @click="cancelEditProjectName" id="cancel-project-name" class="btn ms-1" :class="buttonClass">
            Cancel
        </button>
        <br/>
        <project-name-check-message :check-result="checkResult"></project-name-check-message>
    </span>
</template>
<script lang="ts">
import { VBTooltip } from "bootstrap-vue-3";
import { defineComponent } from "vue";
import {mapActions, mapGetters} from "vuex";
import ProjectNameCheckMessage from "@/components/projects/ProjectNameCheckMessage.vue";
import {ProjectNameCheckResult} from "@/types";

export default defineComponent({
    name: "EditProjectName",
    components: {ProjectNameCheckMessage},
    directives: {
        "b-tooltip": VBTooltip
    },
    props: {
        projectId: String,
        projectName: {type: String, required: true},
        buttonClass: String
    },
    data() {
        return {
            editingProjectName: false,
            checkResult: null,
            inputText: ""
        };
    },
    computed: {
        canSave() {
            return this.checkResult === ProjectNameCheckResult.OK || this.checkResult === ProjectNameCheckResult.Unchanged;
        },
        inputModel: {
            get(){
                return this.inputText;
            },
            set(value: string) {
                this.inputText = value;
                this.checkResult = this.checkProjectName()(this.inputText, this.projectName);
                console.log("change: " + this.checkResult)
            }
        }
    },
    methods: {
        ...mapActions(["renameProject"]),
        ...mapGetters(["checkProjectName"]),
        editProjectName() {
            this.editingProjectName = true;
            this.checkResult = null;
            this.inputText = this.projectName;
        },
        cancelEditProjectName() {
            this.editingProjectName = false;
        },
        saveProjectName() {
            if (this.canSave) {
                if (this.checkResult !== ProjectNameCheckResult.Unchanged) {
                    this.renameProject({projectId: this.projectId, name: this.inputText});
                }
                this.editingProjectName = false;
            }
        }
    }
});
</script>
<style scoped>
.edit-icon {
    color: #a1abb3;
    margin-left: 0.3em;
}

/* Re-use some properties of bootstrap's form control, but without its display box properties*/
.project-name-input {
    border: 1px solid #ced4da;
    border-radius: 0.375em;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.project-name-input:focus {
    border-color: #66afe9;
    outline: 0;
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);
}
</style>
