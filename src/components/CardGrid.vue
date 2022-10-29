<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "@/store";
import type { Bookmark } from "@/types";
import * as utils from "@/utils";

function get_image_url(this: any, bookmark: Bookmark) {

  if (bookmark.streetview.google.id != "none") {
      let width = 150;
      let height = 150;
      // Google streetview api only accepts integer values for FOV when requesting thumbnails
      
      let url = undefined;

      if (bookmark.streetview.google.id.length < 30) {
        url = `https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=${bookmark.streetview.google.id}&cb_client=search.revgeo_and_fetch.gps&w=${width}&h=${height}&yaw=${bookmark.streetview.google.yaw}&pitch=${bookmark.streetview.google.thumbnail_pitch}&thumbfov=${Math.round(parseFloat(bookmark.streetview.google.fov)).toString()}`
      } 
      
      // If is a 360 picture, it is stored in a different server
      else {
        url = `https://lh5.googleusercontent.com/p/${bookmark.streetview.google.id}=w${width}-h${height}-k-no-pi${bookmark.streetview.google.thumbnail_pitch}-ya${bookmark.streetview.google.yaw}-ro-0-fo${Math.round(parseFloat(bookmark.streetview.google.fov)).toString()}`
      }

      return `background-image: url("${url}");`
  }
}



export default defineComponent({
  name: "CardGrid",
  data() {
    return {
      mouseOver: false,
      idxOver: 0,
    };
  },
  methods: {
    toSvg: utils.iconSvg,
    get_image_url,
  },
  setup() {
    const store = useStore();
    return { store };
  },
  async created() {
    // const bapi: any = typeof browser == "undefined" ? chrome : browser;

    if (!this.store.bookmarks_loaded) {
      try {
        await this.store.loadBookmarks();
      } catch (e) {
        alert(`Error loading bookmarks: ${e}`);
      }
    }
  },
});
</script>


<template>
  <div id="wrapper">
    <div id="grid">
      <h1 v-if="store.loading_bookmarks">Loading...</h1>
      <div
        class="card"
        @click="store.nextLevel(bookmark)"
        @mouseenter="mouseOver = true; idxOver = idx"
        @mouseleave="mouseOver = false; idxOver = idx"
        v-for="(bookmark, idx) in store.sorted_bookmarks"

        :style="store.level == store.levels[store.levels.length - 1] ? get_image_url(bookmark) : ''  "
      >
        <h3 style="color: red">
          {{
            bookmark.location[store.level] == "" ||
            bookmark.location[store.level] == undefined
              ? "Unknown"
              : bookmark.location[store.level]
          }}
        </h3>

        <div
          v-if="mouseOver && idxOver == idx"
          class="delete" style="z-index: 999999;"
          @click="store.removeBookmark($event, bookmark)"
          v-html="toSvg('delete', { width: 20, height: 20, color: 'black' })"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delete {
  position: absolute;
  background-color: red;
  width: 20px;
  height: 20px;
  top: 0;
  right: 0;
  /* bottom: 0; */
  /* right: 0; */
}
/*
.card:first-child::before {
    background-color: purple !important;
}

.card:first-of-type::before {
    background-color: green;
}
*/


/*
.card::before {
  width: 100%;
  height: 100%;
  position: absolute;
  content: "";
  background-color: var(--view-bg-color);
  filter: brightness(60%);
  transition: 0.3s;
}
*/

.card {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 60% of --view-bg-color which is 25, 25, 25 */
  background-color: rgba(15, 15, 15);
  transition: background-color 0.3s;
  box-shadow: 0 0 15px black;
  cursor: pointer;
}

.card:hover {
  background-color: rgba(25, 25, 25);
  /* filter: brightness(100%); */
}

#wrapper::before {
  width: 100%;
  height: 100%;
  position: absolute;
  content: "";
  background-color: var(--view-bg-color);
  filter: brightness(60%);
}

#wrapper {
  position: relative;
  width: 97%;
  height: 90%;
}

#grid {
  width: 100%;
  height: 100%;
  position: absolute;
  display: inline-flex;
  flex-wrap: wrap;
  /* flex-direction: column; */
  /* justify-content: flex-start; */
  justify-content: flex-start;
  overflow: auto;
  gap: 40px;
  padding: 20px;
  /* margin: -20px; */
}

.row {
  padding-left: 15px;
  padding-right: 20px;
  height: auto;
  width: 100%;
  height: inherit;
  display: flex;
  justify-content: flex-start;
}

.row:first-of-type {
  margin-top: 20px;
}

.row:not(:first-of-type) {
  margin-top: 40px;
}

.row:last-of-type {
  margin-bottom: 20px;
}
</style>