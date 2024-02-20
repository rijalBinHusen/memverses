<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { type VerseToShow } from "./Chapter";
    
    export let chapter = <VerseToShow>{};
    export let arabicSize = 25;
    export let showTafseer = false;

    const dispatch = createEventDispatcher();

    function read(chap: number, verse: number) {

        dispatch("readed", { chap, verse });
        chapter.readed++
    }
</script>

<div class="chapter">
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
        <button on:click={() => read(chapter.chapter, chapter.verse)}>Read</button>
        <button class="move">
            Pindahkan
        </button>
        <span>
            Dibaca: {chapter.readed}x
        </span>
    </div>
</div>

<style lang="scss">
    @import "Verse.scss";
</style>