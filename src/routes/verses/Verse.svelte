<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { type VerseToShow } from "./Chapter";
    import { type FolderInterface } from "../Folder";
    
    export let chapter = <VerseToShow>{};
    export let folderList = <FolderInterface[]>[];
    export let arabicSize = 25;
    export let showTafseer = false;
    
    const dispatch = createEventDispatcher();

    function read(id: number) {

        dispatch("readed", id);
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
    <div class="chapter-info">
        {chapter.chapter}:{chapter.verse}
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
        <span class="chapter-info">
            {chapter.readed}x dibaca
        </span>
        <div>
            <div class="dropdown">
                <button class="dropbtn">Pindah ke</button>
                <div class="dropdown-content">

                  {#each folderList as folder }
                  <span>{folder.name}</span>
                  {/each}
                </div>
              </div>
            <button on:click={() => read(chapter.id)}>Read</button>
        </div>
    </div>
</div>

<style lang="scss">
    @import "Verse.scss";
</style>