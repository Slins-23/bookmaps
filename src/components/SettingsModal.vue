<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "@/store";
import * as utils from "@/utils";

async function update_key(this: any) {
  let current_key = this.store.api_key;
  let new_key = this.apiText.trim();

  // Do nothing if key hasn't been modified
  if (current_key == new_key) { return; }

  let response_code = await this.store.placeholder_call_api(new_key);

  if (response_code == 200) {
    await this.store.update_key(new_key);
    alert("The given API key was successfully validated and updated!");
    this.store.toggleSettingsModal();
  }
  else if (response_code == 401) {
    alert("The given API key is not valid. Please modify it to a valid one in the extension settings (cog icon in the top-right corner of the extension page).");
  }
  else {
    alert(`API server is currently unreachable. Try again later. Call response code: ${response_code}`)
  }
}

export default defineComponent({
  name: "SettingsModal",
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      apiText: "",
    };
  },
  created() {
    this.apiText = this.store.api_key;
  },
  methods: {
    update_key,
    toSvg: utils.iconSvg,
  },
});
</script>

<template>
  <div id="modal">
    <div class="close" @click="store.toggleSettingsModal()"
      v-html="toSvg('x', { width: 43, height: 43, color: 'red' })"></div>
    <div class="wrapper">
      <div class="content" style="display: flex; align-items: center; flex-direction: column">
        Opencagedata API Key (https://opencagedata.com/)
        <br>
        This is required for the extension to work. The information about a location given its coordinates is retrieved
        from this API. You can make a free account and have available up to ~2500 bookmarks per day.
        <div style="width: 100%; margin-top: 20px;">
          <div style="display: flex; justify-content: center; width: 100%; height: 100%; flex-direction: row;">
            <input style="width: 30%;" type="text" v-model="apiText" />
            <button style="margin-left: 15px; padding: 5px" @click="update_key">
              Update
            </button>
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
