<div class="setting">
        
    <label for="chapter-total">Tampilkan ayat sebanyak</label>
    <div id="chapter-total">
        <button>-</button>
        <input bind:value={setting.chapterToShow} type="number" name="" id="">
        <button>+</button>
        <span>Ayat</span>
    </div>
    
    <label for="next-chapter-on-second">Tampilkan ayat selanjutnya dalam</label>
    <div id="next-chapter-on-second">
        <button>-</button>
        <input bind:value={setting.nextChapterOnSecond} type="number" name="" id="">
        <button>+</button>
        <span>Detik</span>
    </div>
    
    <label for="target-per-day">Target membaca per hari</label>
    <div id="target-per-day">
        <button>-</button>
        <input bind:value={setting.readTarget} type="number" name="" id="">
        <button>+</button>
        <span>Kali</span>
    </div>

    <input 
        checked={setting.showFirstLetter} 
        bind:value={setting.showFirstLetter} 
        type="checkbox" 
        id="show-only-first-letter"
        on:change={() => setting.showFirstLetter = !setting.showFirstLetter}
    >
    <label for="show-only-first-letter">Hanya tampilkan kata pertama</label>

    <input 
        checked={setting.showTafseer} 
        bind:value={setting.showTafseer} 
        type="checkbox" 
        name="show-tafsir" 
        id="show-tafsir"
        on:change={() => setting.showTafseer = !setting.showTafseer}
    >
    <label for="show-tafsir">Tampilkan tafsir</label>
    
    <button on:click={submitSetting}>
        Terapkan
    </button>
</div>

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { type FolderUpdate } from "../Folder";
    export let setting = <FolderUpdate>{
        chapterToShow: 5,
        nextChapterOnSecond: 3,
        readTarget: 7,
        showFirstLetter: true,
        showTafseer: true
    }

    const dispatch = createEventDispatcher();

    function submitSetting() {
        dispatch("updateSetting", setting)
    }
</script>