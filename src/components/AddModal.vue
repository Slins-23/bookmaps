<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "@/store";
import * as utils from "@/utils";

async function add(this: any) {

  let result = await this.store.addBookmark(this.bookText, false);

  // Check API, then remind user to update it in the settings if unauthenticated
  switch (result) {
    case 1:
      this.store.toggleAddModal();
      alert("Bookmark successfully added.");
      break;
    case 0:
      this.store.toggleAddModal();
      alert("Bookmark already exists.");
      break;
    case -1:
      this.store.toggleAddModal();
      this.store.toggleSettingsModal();
      alert("The given API key is not valid. Please modify it to a valid one in the extension settings (cog icon in the top-right corner of the extension page).");
      break;
    case -2:
      alert("Invalid format! Please input either a google maps URL containing coordinates or the coordinates themselves separated by ',', ' ', or ':'.")
      break;
    case -3:
      alert(`Could not get API information from given coordinates`)
      break;
    case -4:
      alert("Internal server error or your API/IP is blacklisted")
      break;
    default:
  }
  
}

export default defineComponent({
  name: "AddModal",
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      bookText: "",
    };
  },
  methods: {
    add,
    toSvg: utils.iconSvg,
  },
});
</script>

<template>
  <div id="modal">
    <div
      class="close"
      @click="store.toggleAddModal()"
      v-html="toSvg('x', { width: 43, height: 43, color: 'red' })"
    ></div>
    <div class="wrapper">
      <div
        class="content"
        style="display: flex; align-items: center; flex-direction: column"
      >
      Add bookmark (Google Maps/Street View URL or coordinates)
      <br>
      Note: Coordinates need to be formatted as "xx.xxx, yy.yyy" or "xx.xxx yy.yyy", where "xx.xxx" = latitude and "yy.yyy" = longitude.
        <div style="width: 100%; margin-top: 20px;">
          <div style="display: flex; justify-content: center; height: 100%; width: 100%; flex-direction: row;">
            <input style="width: 90%;" type="text" v-model="bookText" />
            <button style="margin-left: 15px; padding: 5px" @click="add">ADD</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#modal {
  display: flex;
  align-items: center;
  justify-content: center;
  color: red;
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 9992;
  left: 0;
  top: 0;
}

.wrapper {
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: space-between;
  background-color: var(--view-bg-color);
  padding: 20px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
}

.close {
  position: absolute;
  top: 20px;
  left: 20px;
  cursor: pointer;
}
</style>
