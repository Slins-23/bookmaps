<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "@/store";
import * as utils from "@/utils";
import type { Bookmark } from "@/types";

function get_coordinates(url: string) {
  let actual_coords = url.split("@")[1].split(",");
  return `${actual_coords[0]}, ${actual_coords[1]}`;
}

function import_file(this: any, event: Event) {
  let element = event.target as HTMLInputElement;
  let file = element.files![0];
  this.importedFile = file.name;

  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");

  reader.onload = (readEvent) => {
    this.store.import_textContent = readEvent.target?.result;
  };

  this.file_loaded = true;
}

async function update_bookmarks(this: any) {
  // If it is, seemingly, in JSON format (not necessarily valid) instead of an URL list
  if (this.store.import_textContent.trim().indexOf('[') != -1) {
    // Check if it's valid and proceed if so
    try {
      let to_be_imported = JSON.parse(this.store.import_textContent.trim());

      // If only adding new bookmarks to existing ones
      if (!this.store.import_replaceAll) {
        // IT SEEMS THAT JAVASCRIPT DOES NOT COPY OBJECTS WHEN THEY ARE REASSIGNED.
        // For some reason, it seems that the store variable is getting passed by reference.
        // If we set cool_bookmarks = this.store.bookmarks["bookmarks"]
        // for an unknown reason, the contents of that variable is not assigned to the new variable
        // rather, cool_bookmarks now functions as a pointer to this.store.bookmarks['bookmarks']
        // in other words, despite being a new variable, whenever we update the variable "cool_bookmarks"
        // it also updates, with the same value, the original "this.store.bookmarks['bookmarks']" variable
        // I don't know the reason for this, but as it seemed related to a copy/reassignment/pointer issue
        // I tried an alternative way for copying the contents of "this.store.bookmarks['bookmarks']"
        // and it now works as intended.

        // cool_bookmarks = this.store.bookmarks["bookmarks"];
        console.log("A")
        let already_stored = [...this.store.bookmarks];
        // cool_bookmarks = structuredClone(this.store.bookmarks['bookmarks'])

        let added_bookmarks: string[] = [];

        // Go through all new bookmarks
        for (let i = 0; i < to_be_imported.length; i++) {
          let bookmark = to_be_imported[i];
          let found = false;

          // Check if they already exist.
          for (let j = 0; j < already_stored.length; j++) {
            let stored_bookmark = already_stored[j];

            if (JSON.stringify(bookmark) == JSON.stringify(stored_bookmark) || bookmark.coordinates.coordinate_degrees == stored_bookmark.coordinates.coordinate_degrees) {
              found = true;
              break;
            }
          }

          // If they don't, add them. Otherwise, ignore.
          if (!found) {
            // Ignore if bookmark has already been added, in order to avoid duplicates.
            if (!added_bookmarks.includes(JSON.stringify(bookmark))) {
              already_stored.push(bookmark);
              added_bookmarks.push(JSON.stringify(bookmark));
            }
          }
        }

        to_be_imported = [...already_stored];
      }

      console.log("B")

      console.log(`${JSON.stringify(to_be_imported)} \n|\n ${JSON.stringify(this.store.bookmarks)}`)

      if (
        JSON.stringify(to_be_imported) ==
        JSON.stringify(this.store.bookmarks)
      ) {
        alert("Imported/input bookmarks are identical");
        return;
      }

      console.log("C")

      let proceed: boolean = confirm(
        `Are you sure that you want to update the bookmarks? The previous number of bookmarks were ${this.store.bookmarks.length}. Now they will be ${to_be_imported.length}.`
      );

      if (!proceed) {
        return;
      }

      await this.store.setBookmarks(to_be_imported);
      this.store.showImportModal = false;
    } catch (e) {
      alert(`Could not update bookmarks with given JSON. Error: ${e}`);
      return;
    }
  }

  // If it is, seemingly, an URL list instead (not necessarily valid) of a JSON object
  // Anything can be input as long as there are urls separated by newlines
  else {
    try {
      let lines = this.store.import_textContent.split("\n");
      let urls = [];

      for (let i = 0; i < lines.length; i++) {
        if (
          lines[i].indexOf("google") != -1 &&
          lines[i].indexOf("/maps/") != -1
        ) {
          urls.push(lines[i]);
        }
      }

      let old_bookmarks = this.store.bookmarks;



      if (this.store.import_replaceAll) {
        let proceed: boolean = confirm(
          `Are you sure that you want to replace the bookmarks? There were ${old_bookmarks.length} bookmarks, and now there might be ${urls.length}.`
        );

        if (!proceed) {
          return;
        }

        await this.store.setBookmarks([]);
      }

      for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        let coords = get_coordinates(url);
        let coords_exist = await this.store.isBookmarked(coords);
        let id = "none";
        let id_exists = false;

        if (url.indexOf("data=") != -1) {
          if (url.indexOf("streetviewpixels") != -1) {
            id = url.split("%3D")[1].split("%26")[0];
            id_exists = true;
          }
          else if (url.indexOf("googleusercontent") != -1) {
            id = url.split("%2F")[4].split("%3D")[0];
          }
          else {
            id = url.split("data=")[1];

            let last_idx = 0;
            let count = 0;

            for (let i = 0; i < id.length; i++) {
              let char = id[i];

              if (char == "!" && count > 10) {
                last_idx = i;
                break;
              } else if (char == "!" && count != 22) {
                count = 0;
              } else {
                count++;
              }
            }

            // id = id.slice(last_idx - 22, last_idx)
            id = url.length < 145 ? id.slice(last_idx - 22, last_idx) : id.slice(last_idx - 44, last_idx)
            id_exists = true;
          }
        }

        let found_id = false;

        if (id_exists) {
          found_id = await this.store.isBookmarkedId(id);

          /*
          if (!coords_exist && found_id) {
  
            alert(`Gotten here.2!!! Logged`)
  
  
            console.log(`URL (new one to be added): ${url}`)
  
            this.store.bookmarks['bookmarks'].filter((booky: Bookmark) => {
              if (booky.streetview.google.id == id) {
                console.log(`OLD BOOK (to be compared): ${JSON.stringify(booky)}`)
              }
            })
            
          }
          */
        }

        let is_bookmarked = coords_exist || found_id;

        if (!is_bookmarked) {
          let result = await this.store.addBookmark(url, false);

          // If API is invalid, reset bookmarks and stop processing
          //if (this.store.import_replaceAll && !result) { 

          // If error, reset bookmarks

          // Stop processing and reset bookmarks if server is unreachable
          if (result == -1 || result == -4) {
            await this.store.setBookmarks(old_bookmarks);

            // If the error is due to an invalid API key, alert the user and prompt to change
            if (result == -1) {
              this.store.toggleImportModal();
              this.store.toggleSettingsModal();
              alert("The given API key is not valid. Please modify it to a valid one in the extension settings (cog icon in the top-right corner of the extension page).");
            }

            return;
          }
        }
      }
    }
    catch (e) {
      alert(`Could not update bookmarks with given JSON. Error: ${e}`);
      return;
    }
  }

  this.store.showImportModal = false;
  this.store.import_textContent = "";
}

export default defineComponent({
  name: "ImportModal",
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      file_loaded: false,
      importedFile: "",
    };
  },
  methods: {
    toSvg: utils.iconSvg,
    update_bookmarks,
    import_file,
    click_fileInput: () => document.getElementById("file-input")?.click(),
  },
});
</script>

<template>
  <div id="modal">
    <div class="close" @click="store.toggleImportModal()" v-html="toSvg('x', { width: 43, height: 43, color: 'red' })">
    </div>
    <div class="wrapper">
      <div class="button-wrap" style="
          display: flex;
          width: 100%;
          justify-content: center;
          margin-top: 15px;
          margin-bottom: 10px;
        ">
        <div class="okbroz" style="
            display: flex;
            overflow: hidden;
            flex-direction: column;
            text-align: center;
          ">
          <div>
            <button @click="click_fileInput">Import JSON</button>
            <input id="file-input" style="display: none" name="file-input" type="file" @change="import_file($event)"
              accept=".json" />
          </div>
          <span v-bind:style="`margin-top: 5px; padding: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; visibility: ${file_loaded ? 'visible' : 'hidden'
          };`">Last loaded file: {{ importedFile }}</span>
        </div>
      </div>
      <div class="options-wrapper" style="
          display: flex;
          justify-content: center;
          flex-direction: row;
          margin-left: 10px;
          margin-bottom: 10px;
        ">
        <input type="checkbox" v-model="store.import_replaceAll" />
        <label for="checkbox" style="margin-left: 10px">Replace All - If enabled, the new bookmark(s) will replace ALL
          of the old ones. If disabled, new bookmark(s) (mutually exclusive) will be added while keeping the old
          ones.</label>
      </div>
      <div class="text-wrapper" style="
          display: flex;
          align-items: center;
          justify-content: space-around;
          flex-direction: column;
          width: 100%;
          height: 100%;
        ">
        <textarea v-model="store.import_textContent" style="
            width: 80%;
            height: 75%;
            resize: none;
            max-height: 30vh;
            max-width: 90%;
          "></textarea>
        <button style="margin-bottom: 5px; margin-top: 5px" @click="update_bookmarks">
          Save
        </button>
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
