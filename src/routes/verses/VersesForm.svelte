<style lang="scss">
    @import "../../scss/form.scss";
    .primary-button {
        margin-top: 1rem;
    }
</style>

<div class="form">
    <label for="list-verses">Pilih surah</label>
    <select bind:value={verseNumber} on:change={selectVerse} name="list-verses" id="list-verses">
        {#each listVersesAndInfo as verses}
            <option value={verses.nomor}> {verses.nama_latin} </option>
        {/each}
    </select>

    {#if startChapter > 0 }
    <div class="select-chapter">

        <label for="start-chapter">Mulai dari ayat</label>
        <input type="number" min="1" max={endChapter} bind:value={startChapter} name="start-chapter" id="start-chapter">
    
        <label for="end-chapter">Sampai dengan ayat</label>
        <input type="number" min={startChapter} max={currentVerse.jumlah_ayat} bind:value={endChapter} name="end-chapter" id="end-chapter">
    </div>
    {/if}

    <button class="primary-button" on:click={submitVerseChapter}>Tambahkan</button>
</div>

<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";


    interface Verse {
        nomor: number,
        nama_latin: string,
        jumlah_ayat: number
    }

	let listVersesAndInfo = <Verse[]>[];
    let currentVerse = <Verse>{};
    let verseNumber = 0;
    let startChapter = 0;
    let endChapter = 0;

    async function getListVerses (): Promise<Verse[]|undefined> {
        // retrieve on static json
        const retrieve = await fetch("/verses.static.json");

        if(!retrieve) return;
        const data = await retrieve.json() as Verse[];
        
        listVersesAndInfo = data;
    }

    onMount(() => getListVerses());

    function selectVerse() {
        const findIndex = listVersesAndInfo.findIndex((verse) => verse.nomor === verseNumber);
        if(findIndex < 0) return;

        currentVerse = listVersesAndInfo[findIndex];
        endChapter = currentVerse.jumlah_ayat;
        startChapter = 1;
    }

    const dispatch = createEventDispatcher();

    function submitVerseChapter() {
        dispatch("verseAndChapterSubmitted", {
            verse: currentVerse.nomor,
            startChapter,
            endChapter
        })
    }

</script>