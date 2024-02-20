<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { type VerseToShow, ChaptersOperation } from "./Chapter";
    
    export let chapter = <VerseToShow>{};
    export let arabicSize = 25;
    export let showTafseer = false;

    const chaptersOps = new ChaptersOperation();
    const folder = chaptersOps.getFoldersList();
    
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
            <p>Tafsir ayat</p>
            {chapter.tafsir}
        </div>
    {/if}
    <div class="navigation">        
        <span>
            Dibaca: {chapter.readed}x
        </span>

        <div>
            <div class="dropdown">
                <button class="dropbtn">Pindah ke</button>
                <div class="dropdown-content">
                {#if folder && folder.length}

                  {#each folder as fold }
                  <span>{fold.name}</span>
                  {/each}
                {/if}
                </div>
              </div>
            <button on:click={() => read(chapter.chapter, chapter.verse)}>Read</button>
        </div>
    </div>
</div>

<style lang="scss">
    @import "Verse.scss";
</style>