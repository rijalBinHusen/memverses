<style lang="scss">
    @import "../../scss/form.scss";
    .primary-button {
        margin-top: 1rem;
    }
</style>

<div class="form">
    <label for="list-verses">Pilih surah</label>
    <select bind:value={chapterNumber} on:change={selectVerse} name="list-verses" id="list-verses">
        {#each listVersesAndInfo as verses}
            <option value={verses.nomor}>{verses.nomor} - {verses.nama_latin} </option>
        {/each}
    </select>

    {#if startVerse > 0 }
    <div class="select-chapter">

        <label for="start-chapter">Mulai dari ayat</label>
        <input type="number" min="1" max={endVerse} bind:value={startVerse} name="start-chapter" id="start-chapter">
    
        <label for="end-chapter">Sampai dengan ayat</label>
        <input type="number" min={startVerse} max={currentChapter.jumlah_ayat} bind:value={endVerse} name="end-chapter" id="end-chapter">
    </div>
    {/if}

    <button class="primary-button" on:click={submitVerseChapter}>Tambahkan</button>
</div>

<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import type { ChapterFormInterface } from "./Chapter";

    interface Chapter {
        nomor: number,
        nama_latin: string,
        jumlah_ayat: number
    }

	let listVersesAndInfo = <Chapter[]>[];
    let currentChapter = <Chapter>{};
    let chapterNumber = 0;
    let startVerse = 0;
    let endVerse = 0;

    async function getListVerses (): Promise<Chapter[]|undefined> {
        // retrieve on static json
        const retrieve = await fetch("/verses.static.json", { cache: "force-cache"});

        if(!retrieve) return;
        const data = await retrieve.json() as Chapter[];
        
        listVersesAndInfo = data;
    }

    onMount(() => getListVerses());

    function selectVerse() {
        const findIndex = listVersesAndInfo.findIndex((verse) => verse.nomor === chapterNumber);
        if(findIndex < 0) return;

        currentChapter = listVersesAndInfo[findIndex];
        endVerse = currentChapter.jumlah_ayat;
        startVerse = 1;
    }

    const dispatch = createEventDispatcher();

    function submitVerseChapter() {
        dispatch("verseAndChapterSubmitted", <ChapterFormInterface>{
            chapter: currentChapter.nomor,
            startVerse,
            endVerse
        })
    }

</script>