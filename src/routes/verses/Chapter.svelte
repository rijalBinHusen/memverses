<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { type ChapterToShow } from "./verses";
    import { fade } from "svelte/transition";
    export let chapter = <ChapterToShow>{};
    export let arabicSize = 25;
    export let showTafseer = false;

    const dispatch = createEventDispatcher();

    function read(chap: number, verse: number) {

        dispatch("readed", { chap, verse });
        chapter.readed++
    }
</script>

<div class="chapter" transition:fade={{ delay: 250, duration: 800 }}>
    <div class="arabic" style={'font-size:'+ arabicSize + 'px'}>

        { chapter.showFirstLetter
            ? chapter.arabic.slice(0, 10)
            : chapter.arabic
        }
    </div>
    <div class="translation">
        {chapter.translate}
    </div>
    {#if showTafseer }
        
        <div class="tafsir">
            {chapter.tafsir}
        </div>
    {/if}
    <div class="navigation">
        <button class="move">
            Pindahkan
        </button>
        <button on:click={() => read(chapter.chapter, chapter.verse)}>Read</button>
        <span>
            Readed: {chapter.readed}
        </span>
    </div>
</div>

<style lang="scss">
    @import "Chapter.scss";
</style>