<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { type VerseToShow } from "./Chapter";
    import { type FolderInterface } from "../Folder";
    
    export let verse = <VerseToShow>{};
    export let folderList = <FolderInterface[]>[];
    export let arabicSize = 25;
    export let showTafseer = false;
    
    const dispatch = createEventDispatcher();

    function read(id: number) {

        dispatch("readed", id);
        verse.readed++
    }

    function moveToFolder(idFolder: string, idVerse: number) {

        dispatch("move", { idFolder, idVerse });
    }
</script>

<div class="verse">
    <div class="arabic" style={'font-size:'+ arabicSize + 'px'}>

        { verse.showFirstLetter
            ? verse.arabic.slice(0, 10)
            : verse.arabic
        }
    </div>
    <div class="verse-info">
        {verse.verse}:{verse.verse}
    </div>
    <div class="translation">
        {verse.translate}
    </div>
    {#if showTafseer }
        
        <div class="tafsir">
            <p>Tafsir ayat</p>
            {verse.tafsir}
        </div>
    {/if}
    <div class="navigation">        
        <span class="verse-info">
            {verse.readed}x dibaca
        </span>
        <div>
            <div class="dropdown">
                <button class="dropbtn">Pindah ke</button>
                <div class="dropdown-content">

                  {#each folderList as folder }
                  <span on:click={() => moveToFolder(folder.id, verse.id)}>{folder.name}</span>
                  {/each}
                </div>
              </div>
            <button on:click={() => read(verse.id)}>Read</button>
        </div>
    </div>
</div>

<style lang="scss">
    @import "Verse.scss";
</style>