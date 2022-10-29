<script lang="ts">
import CardGrid from "./CardGrid.vue";
import { defineComponent } from "vue";
import type { Bookmark } from "@/types";
import { useStore } from "@/store";
import * as utils from "@/utils";
// import browser from "webextension-polyfill";

export default defineComponent({
  name: "Home",
  setup() {
    console.log("got setup")
    const store = useStore();
    console.log(`levelText: ${store.levelText}\nlevel: ${store.level}\nsorted_bookmarks: ${JSON.stringify(store.sorted_bookmarks)}\nshown_bookmarks: ${JSON.stringify(store.shown_bookmarks)}\nunknown_shown: ${store.unknown_shown}`)
    return { store }
  },
  methods: {
    toSvg: utils.iconSvg,
    goHome() {
      while (this.store.level != this.store.levels[0]) {
        this.store.previousLevel()
      }
    }
  },
  data() {
    return {
      // Prefer city over county
      // Wait to reset level to 0 instantly
      // state interchangeable with prefecture, province
      // "county" should be in between "state/prefecture" and "city", but sometimes they're interchangeable in the maps API, so I will ignore it
      // ignore if city is the same as the city district i.e. city: Paris city_district: Paris
      // do the same for town/suburb/neighbourhood
    };
  },
  components: {
    CardGrid,
  },
  async created() {
    try {
      await this.store.load_key();
      console.log(`Loaded API key: ${JSON.stringify(this.store.api_key)}`)
    } catch (e) {
      alert(`Error loading API key: ${e}`);
    }
    
    console.log("got created")
    /*
    console.log("start mount");
    await bapi.runtime
      .sendMessage({ type: "get_bookmarks" })
      .then((data) => {
        console.log("getting data");
        console.log(`actual data: ${JSON.stringify(data)}`);
        thisstore.bookmarks = data;
        console.log("got data");
      });
    console.log("end mount");
    */
  },
  mounted() {
    console.log("got mounted")
    // feather.replace();
  },
});

</script>

<template>
  <div class="wrapper">
    <!-- Plus icon should have the same height as the search bar. Height is actually found through its ::before -->
    <div class="bar-wrapper">
      <div @click="store.toggleAddModal()" class="add btn" v-html="toSvg('bookmark', {width: 43, height: 43})"></div>
      <div class="search-bar">
        <div style="margin-left: 5px; justify-self: flex-start;" v-html="toSvg('search', {'stroke-width': 1, color: 'lightgrey'})"></div>
        <input v-model="store.search" type="text" id="search-text" />
      </div>
      <div class="last" style="display: flex; align-items: flex-end">
        <div @click="store.toggleExportModal()" class="exp btn" v-html="toSvg('download', {width: 43, height: 43})"></div>
        <div style="margin-right: 10px"></div>
        <div @click="store.toggleImportModal()" class="imp btn" v-html="toSvg('file-plus', {width: 43, height: 43})"></div>
      </div>
    </div>
    <div class="divider" style="display: flex; justify-content: center">
      <div
        style="
          width: 33px;
          height: 33px;
          margin-top: 10px;
          margin-left: 10px;
          margin-right: auto;
          display: flex;
        "
      >
        <div
          @click="store.previousLevel"
          class="return"
          v-html="toSvg('corner-up-left')"
          v-show="store.level != store.levels[0]"
        ></div>
        <div
          @click="goHome"
          class="home"
          v-html="toSvg('home')"
          v-show="store.level != store.levels[0]"
        >

        </div>
      </div>
      <h1 style="margin-right: auto; color: red;">{{ store.levelText }}</h1>
    </div>
    <CardGrid />
    <!-- <div class="divider"></div> -->
  </div>
</template>

<style scoped>
.content {
  width: 20%;
  height: 40%;
  background-color: white;
  box-shadow: 0 0 10px black;
}

.wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.return {
  background-color: rgba(0, 0, 0, 0);
  padding: 5px;
  color: red;
  cursor: pointer;
  transition: 0.3s;
}

.return:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.home {
  background-color: rgba(0, 0, 0, 0);
  padding: 5px;
  color: red;
  cursor: pointer;
  transition: 0.3s;
  margin-left: 10px;
}

.home:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.divider {
  background-color: var(--view-bg-color);
  height: auto;
  width: 97%;
  filter: brightness(60%);
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.bar-wrapper {
  display: flex;
  align-items: flex-end;
  /* justify-content: space-between; */
  justify-content: center;
  width: 97%;
}

.add {
  background-color: var(--view-bg-color);
  filter: brightness(60%);
  position: absolute;
  left: 0;
  /* margin-right: auto; */
  /* justify-self: flex-start; */
  /* position: absolute; */
  /* left: 0; */
}

.imp {
  width: 43px;
  height: 43px;
  background-color: var(--view-bg-color);
  filter: brightness(60%);
  /* margin-left: auto; */
}

.exp {
  width: 43px;
  height: 43px;
  background-color: var(--view-bg-color);
  filter: brightness(60%);
}

.rep {
  background-color: var(--view-bg-color);
  filter: brightness(60%);
}

.search-bar::before {
  position: absolute;
  width: 103%;
  height: 100%;
  background-color: var(--view-bg-color);
  content: "";
  filter: brightness(60%);
  padding: 15px;
}

.last {
  position: absolute;
  right: 0;
}

.search-bar {
  margin-top: 30px;
  display: flex;
  align-items: center;
  /* justify-content: space-betwee; */
  width: 30%;
  height: 80%;
  /* justify-content: center; */
  /* flex-direction: row; */
  /* align-items: center; */
  /* width: 30%; */
  /* height: 50px; */
}

#search-text {
  width: 100%;
  height: 60%;
  padding: 1px;
  margin-left: 5px;
  background-color: lightgrey;
  /* justify-self: flex-end; */
  /* width: 100%; */
  /* height: 70%; */
}
</style>