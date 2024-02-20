<div class="setting">
        
    <label for="chapter-total">Tampilkan ayat sebanyak</label>
    <div class="increment-decrement" id="chapter-total">
        <button on:click={() => decrement('verseToShow')}>-</button>
        <input bind:value={setting.verseToShow} type="number" name="" id="">
        <button on:click={() => increment('verseToShow')}>+</button>
        <span>Ayat</span>
    </div>
    
    <label for="next-chapter-on-second">Tampilkan ayat selanjutnya dalam</label>
    <div class="increment-decrement" id="next-chapter-on-second">
        <button on:click={() => decrement('nextChapterOnSecond')}>-</button>
        <input bind:value={setting.nextChapterOnSecond} type="number" name="" id="">
        <button on:click={() => increment('nextChapterOnSecond')}>+</button>
        <span>Detik</span>
    </div>
    
    <label for="target-per-day">Target membaca per hari</label>
    <div class="increment-decrement" id="target-per-day">
        <button on:click={() => decrement('readTarget')}>-</button>
        <input bind:value={setting.readTarget} type="number" name="" id="">
        <button on:click={() => increment('readTarget')}>+</button>
        <span>Kali</span>
    </div>

    <label for="arabic-size">Ukuran text arab</label>
    <div class="increment-decrement" id="arabic-size">
        <button on:click={() => decrement('arabicSize')}>-</button>
        <input bind:value={setting.arabicSize} type="number" name="" id="">
        <button on:click={() => increment('arabicSize')}>+</button>
        <span>Pixel</span>
    </div>

    <div class="checkbox">
        
        <input 
            checked={setting.showFirstLetter}
            type="checkbox" 
            id="show-only-first-letter"
            on:change={() => setting.showFirstLetter = !setting.showFirstLetter}
        >
        <label for="show-only-first-letter">Hanya tampilkan kata pertama</label>

    </div>

    <div class="checkbox">
        
        <input 
            checked={setting.showTafseer}
            type="checkbox" 
            name="show-tafsir" 
            id="show-tafsir"
            on:change={() => setting.showTafseer = !setting.showTafseer}
        >
        <label for="show-tafsir">Tampilkan tafsir</label>
    
    </div>
    <button class="primary-button" on:click={submitSetting}>
        Terapkan
    </button>
</div>

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { type FolderUpdate } from "../Folder";
    export let setting = <FolderUpdate>{
        verseToShow: 5,
        nextChapterOnSecond: 3,
        readTarget: 7,
        showFirstLetter: true,
        showTafseer: true,
        arabicSize: 25
    }

    type varNumber = 'verseToShow'|'nextChapterOnSecond'|'readTarget'|'arabicSize';
    
    function decrement(whatVar: varNumber) {
        //@ts-ignore
        if(typeof whatVar === "undefined" || setting[whatVar] == 1) return;
        //@ts-ignore
        setting[whatVar] = setting[whatVar] -1
    }
    
    function increment(whatVar: varNumber) {
        if(typeof whatVar === "undefined") return;

        //@ts-ignore
        setting[whatVar] = setting[whatVar] +1
    }

    const dispatch = createEventDispatcher();

    function submitSetting() {
        dispatch("updateSetting", setting)
    }
</script>

<style lang="scss">
    @import "SettingForm.scss";

</style>