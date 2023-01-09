<template>
  <div>
  <div class="modal-backdrop fade show">
  </div>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <header class="modal-header">
          <slot name="header"> </slot>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </header>
        <section class="modal-body">
          <slot name="body"> </slot>
        </section>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts">
export default {
    name: "ModalTemplate"
};
</script>
