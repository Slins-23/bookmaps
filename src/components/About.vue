<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
    name: "About",
    setup() {
        console.log("got setup")
        const store = useStore();
        console.log(`levelText: ${store.levelText}\nlevel: ${store.level}\nsorted_bookmarks: ${JSON.stringify(store.sorted_bookmarks)}\nshown_bookmarks: ${JSON.stringify(store.shown_bookmarks)}\nunknown_shown: ${store.unknown_shown}`)
        return { store }
    },
    data() {
        return {

        }
    },
})

</script>

<template>
    <div class="about">
        <h1>This is an about page.</h1>
    </div>
</template>

<style scoped>
.about {
    background-color: purple;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

</style>