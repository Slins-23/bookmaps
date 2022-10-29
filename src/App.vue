<script lang="ts">
import { defineComponent } from "vue";
import AddModal from "@/components/AddModal.vue";
import SettingsModal from "@/components/SettingsModal.vue";
import ImportModal from "@/components/ImportModal.vue";
import ExportModal from "@/components/ExportModal.vue";
import { useStore } from "@/store";
import * as utils from "@/utils";

export default defineComponent({
  name: "App",
  components: {
    AddModal,
    SettingsModal,
    ImportModal,
    ExportModal,
  },
  methods: {
    toSvg: utils.iconSvg,
  },
  setup() {
    const store = useStore();
    return { store };
  },
  mounted() {
    this.store.updateRoute();
  },
});
</script>

<template>
  <AddModal v-if="store.showAddModal" />
  <SettingsModal v-if="store.showSettingsModal"/>
  <ImportModal v-if="store.showImportModal"/>
  <ExportModal v-if="store.showExportModal"/>

  <div id="wrapper">
    <h1 class="title">Bookmaps</h1>
    <div @click="store.toggleSettingsModal()" class="settings btn" v-html="toSvg('settings', {width: 50, height: 50})"></div>

    <div id="content">
      <nav class="nav-wrapper">
        <ul>
          <li
            :class="store.current_tab === idx ? 'active' : ''"
            v-for="(route, idx) in store.routes"
            :key="route.id"
            @click="store.current_tab = idx;"
          >
            <RouterLink class="list-item" :to="route.route">{{
              route.title
            }}</RouterLink>
          </li>
        </ul>
      </nav>
      <RouterView id="router-view" />
    </div>
  </div>
</template>

<style>
:root {
  --bg-color: rgb(49, 49, 49);
  --view-bg-color: rgb(25, 25, 25);
  --nav-bg-active-color: var(--view-bg-color);
  /* --nav-bg-hovered-color: rgb(0, 0, 200); */
  /* --nav-bg-inactive-color: var(--nav-bg-active-color); */
  --nav-text-color: red;
  /* --nav-text-hovered-color: rgb(200, 0, 0); */
  /* --nav-text-inactive-color: rgb(160, 0, 0); */
}

.btn {
  cursor: pointer;
}

.settings {
  position: absolute;
  width: 50px;
  height: 50px;
  stroke-width: 2;
  top: 10px;
  right: 10px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  position: relative;
  font-weight: normal;
  overflow: none;
}

body {
  background-color: rgb(49, 49, 49);
}

a {
  text-decoration: none;
}

#wrapper {
  display: flex;
  height: 100vh;
  align-items: center;
  flex-direction: column;
}

h1.title {
  font-family: "Arial";
  font-size: calc(0.02 * 100vw + 0.035 * 100vh);
}

#content {
  display: flex;
  flex-direction: column;
  /* background-color: rgb(25, 25, 25); */
  width: 80%;
  margin-top: calc(0.05 * 100vh);
  margin-bottom: calc(0.05 * 100vh);
  flex-grow: 1;
}

nav {
  background-color: var(--view-bg-color);
  align-self: center;
  /* padding: 15px; */
}

nav ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

nav li {
  background-color: var(--view-bg-color);
  transition: 0.3s;
  float: left;
  filter: brightness(60%);
  /* padding-top: calc(0.005 * 100vh); */
  /* padding-left: calc(0.03 * 100vh); */
  /* padding-rig  ht: calc(0.03 * 100vh); */
}

nav li:hover {
  filter: brightness(90%);
  background-color: var(--view-bg-color);
}

.active {
  background-color: var(--view-bg-color);
  transition: 0.3s;
  filter: brightness(100%);
}

.active:hover {
  background-color: var(--view-bg-color);
}

nav li a {
  padding-top: calc(0.005 * 100vh);
  padding-left: calc(0.03 * 100vh);
  padding-right: calc(0.03 * 100vh);
  color: var(--nav-text-color);
  font-size: 2em;
  font-family: "Arial";
  transition: 0.3s;
  filter: brightness(60%);
}

nav li a:hover {
  color: var(--nav-text-color);
  filter: brightness(90%);
}

.active a {
  color: var(--nav-text-color);
  filter: brightness(100%);
}

.active a:hover {
  color: var(--nav-text-color);
  filter: grayscale(0%);
}

#router-view {
  background-color: var(--view-bg-color);
  height: 100%;
}

/*
@import "@/assets/base.css";

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

@media (min-width: 1024px) {
  body {
    display: flex;
    place-items: center;
  }
}
*/
</style>
