<template>
  <div>
    <div>
      <button
        v-if='!microreactToken'
        @click='showModal()'
        class='btn btn-block btn-standard btn-download'
      >
        Generate Microreact URL
      </button>

      <button
        v-if='tokenAvailable'
        @click='buildMicroreactURL(cluster)'
        class='btn btn-block btn-standard btn-download'
      >
        Generate Microreact URL
      </button>

      <a
        v-if= 'URLgenerated'
        :href='results.perCluster[cluster]?.microreactURL'
        class='btn btn-block btn-standard btn-download'
        target='_blank'
        rel='noreferrer'
      >
        Visit Microreact URL
      </a>
    </div>

    <Modal v-if='isModalVisible' @close='closeModal' class='modalFlex'>
      <template v-if='tokenWasWrong' v-slot:header>
        Your submitted token is invalid
      </template>
      <template v-else v-slot:header> No token submitted yet </template>

      <template v-if='tokenWasWrong' v-slot:body>
        <p>It seems that the token you gave us was wrong.</p>
        <p>
          Please make sure you are using a correct token.<br />
          You can find your token in your
          <a href='https://microreact.org/my-account/settings' target='_blank'>
            Microreact Account Settings</a
          >.
        </p>
        <input v-model='token' placeholder='Microreact  API Token' />
        <button
          @click='
            closeModal();
            saveToken();
          '
          class='btn btn-block btn-standard btn-download'
        >
          Save token
        </button>
      </template>
      <template v-else v-slot:body>
        <p>You have not submitted a your Microreact token yet.</p>
        <p>
          This is needed to generate a microreact URL for you.<br />
          You can find your token in your
          <a href='https://microreact.org/my-account/settings' target='_blank'>
            Microreact Account Settings</a
          >.
        </p>
        <input v-model='token' placeholder='Microreact  API Token' />
        <button
          @click='
            closeModal();
            saveToken();
          '
          class='btn btn-block btn-standard btn-download'
        >
          Save token
        </button>
      </template>
    </Modal>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'vuex';
import Modal from '@/components/Modal.vue';
import { BeebopError, Errors } from '../types';

export default defineComponent({
  name: 'GenerateMicroreactURL',
  props: ['cluster'],
  components: {
    Modal,
  },
  data() {
    return {
      isModalVisible: false,
      token: null,
    };
  },
  methods: {
    ...mapActions(['buildMicroreactURL']),
    showModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    saveToken() {
      this.buildMicroreactURL({ cluster: this.cluster, token: this.token });
    },
  },
  computed: {
    ...mapState(['results', 'microreactToken', 'errors']),
    tokenWasWrong() {
      return this.errors.some((e: BeebopError) => e.error === Errors.WRONG_TOKEN);
    },
    tokenAvailable() {
      return this.microreactToken && !this.results.perCluster[this.cluster]?.microreactURL;
    },
    URLgenerated() {
      return this.microreactToken && this.results.perCluster[this.cluster]?.microreactURL;
    },
  },
});
</script>
