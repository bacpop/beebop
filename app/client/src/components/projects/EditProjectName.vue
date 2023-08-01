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
               :value="projectName" />
        <button @click="saveProjectName" id="save-project-name" class="btn ms-2" :class="buttonClass">
            Save
        </button>
        <button @click="cancelEditProjectName" id="cancel-project-name" class="btn ms-1" :class="buttonClass">
            Cancel
        </button>
    </span>
</template>
<script lang="ts">
import { VBTooltip } from "bootstrap-vue-3";
import { defineComponent } from "vue";
import { mapActions } from "vuex";

export default defineComponent({
    name: "EditProjectName",
    directives: {
        "b-tooltip": VBTooltip
    },
    props: {
        projectId: String,
        projectName: String,
        buttonClass: String
    },
    data() {
        return {
            editingProjectName: false
        };
    },
    methods: {
        ...mapActions(["renameProject"]),
        editProjectName() {
            this.editingProjectName = true;
        },
        cancelEditProjectName() {
            this.editingProjectName = false;
        },
        saveProjectName() {
            const name = (this.$refs.renameProject as HTMLInputElement).value;
            this.renameProject({ projectId: this.projectId, name });
            this.editingProjectName = false;
        }
        // TODO: prevent rename for empty name or existing name or name unchanged
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
