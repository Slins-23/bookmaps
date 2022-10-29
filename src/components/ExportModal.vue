<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "@/store";
import * as utils from "@/utils";

function file_url(this: any) {
  return (
    "data:text/json;charset=utf8," +
    encodeURIComponent(JSON.stringify(this.store.bookmarks))
  );
}

export default defineComponent({
  name: "ExportModal",
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
    };
  },
  methods: {
    toSvg: utils.iconSvg,
  },
  computed: {
    file_url,
    textContent() {
      return JSON.stringify(this.store.bookmarks);
    },
  },
});
</script>

<template>
  <div id="modal">
    <div
      class="close"
      @click="store.toggleExportModal()"
      v-html="toSvg('x', { width: 43, height: 43, color: 'red' })"
    ></div>
    <div class="wrapper">
      <div
        class="button-wrap"
        style="
          display: flex;
          width: 100%;
          justify-content: center;
          margin-top: 15px;
        "
      >
        <a download="bookmarks.json" :href="file_url">
          <button>JSON File Export</button>
        </a>
      </div>
      <br />

      <br />
      <br />
      <div
        class="text-wrapper"
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          width: 100%;
          height: 100%;
        "
      >
        <!--
        <div class="obve" style="margin-top: 50px; margin-bottom: 5px;">
          <div
            class="checkbox-wrap"
            style="display: flex; width: 100%; justify-content: center"
          >
            <input type="checkbox" v-model="showJSON" />
            <label for="checkbox" style="margin-left: 10px"
              >Show JSON text</label
            >
          </div>
        </div>
        -->

        <textarea
          v-model="textContent"
          readonly
          style="
            width: 80%;
            height: 80%;
            resize: none;
            max-height: 30vh;
            max-width: 90%;
          "
        ></textarea>
      </div>

      <!-- JSON Text <checkbox></checkbox> <textarea v-if=""></textarea>" -->
    </div>
  </div>
</template>

<style scoped>
#modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  color: red;
  z-index: 9992;
  left: 0;
  top: 0;
}

.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--view-bg-color);
  width: 30%;
  height: 50%;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
}

.close {
  position: absolute;
  top: 20px;
  left: 20px;
  cursor: pointer;
}
</style>
