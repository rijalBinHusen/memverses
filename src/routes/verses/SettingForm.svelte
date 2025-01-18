<div class="setting">
        
    <label for="chapter-total">Tampilkan ayat sebanyak</label>
    <div class="increment-decrement" id="chapter-total">
        <button on:click={() => decrement('total_verse_to_show')}>-</button>
        <input bind:value={setting.total_verse_to_show} type="number" name="" id="">
        <button on:click={() => increment('total_verse_to_show')}>+</button>
        <span>Ayat</span>
    </div>
    
    <label for="next-chapter-on-second">Tampilkan ayat selanjutnya dalam</label>
    <div class="increment-decrement" id="next-chapter-on-second">
        <button on:click={() => decrement('show_next_chapter_on_second')}>-</button>
        <input bind:value={setting.show_next_chapter_on_second} type="number" name="" id="">
        <button on:click={() => increment('show_next_chapter_on_second')}>+</button>
        <span>Detik</span>
    </div>
    
    <label for="target-per-day">Target membaca per hari</label>
    <div class="increment-decrement" id="target-per-day">
        <button on:click={() => decrement('read_target')}>-</button>
        <input bind:value={setting.read_target} type="number" name="" id="">
        <button on:click={() => increment('read_target')}>+</button>
        <span>Kali</span>
    </div>

    <label for="arabic-size">Ukuran text arab</label>
    <div class="increment-decrement" id="arabic-size">
        <button on:click={() => decrement('arabic_size')}>-</button>
        <input bind:value={setting.arabic_size} type="number" name="" id="">
        <button on:click={() => increment('arabic_size')}>+</button>
        <span>Pixel</span>
    </div>

    <!-- <div class="checkbox">
        
        <input 
            checked={setting.isShowRandomVerse}
            type="checkbox" 
            name="show-random-verse" 
            id="show-random-verse"
            on:change={() => setting.isShowRandomVerse = !setting.isShowRandomVerse}
        >
        <label for="show-random-verse">Tampilkan ayat secara acak</label>
    
    </div> -->

    <div class="checkbox">
        
        <input 
            checked={setting.is_show_first_letter}
            type="checkbox" 
            id="show-only-first-letter"
            on:change={() => setting.is_show_first_letter = !setting.is_show_first_letter}
        >
        <label for="show-only-first-letter">Hanya tampilkan kata pertama</label>

    </div>

    <div class="checkbox">
        
        <input 
            checked={setting.is_show_tafseer}
            type="checkbox" 
            name="show-tafsir" 
            id="show-tafsir"
            on:change={() => setting.is_show_tafseer = !setting.is_show_tafseer}
        >
        <label for="show-tafsir">Tampilkan tafsir</label>
    
    </div>
    <button class="primary-button" on:click={submitSetting}>
        Terapkan
    </button>
</div>

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { type FolderUpdate } from "../index/Folder";
    export let setting = <FolderUpdate>{
        total_verse_to_show: 5,
        show_next_chapter_on_second: 3,
        read_target: 7,
        is_show_first_letter: true,
        showTafseer: true,
        arabic_size: 25
    }

    type varNumber = 'total_verse_to_show'|'show_next_chapter_on_second'|'read_target'|'arabic_size';
    
    function decrement(whatVar: varNumber) {
        const isVariableOkay = typeof whatVar === "undefined" || setting[whatVar] == 1;
        if(!isVariableOkay) return;
        //@ts-ignore
        setting[whatVar] = setting[whatVar] -1
    }
    
    function increment(whatVar: varNumber) {
        const isVariableOkay = typeof whatVar === "undefined" || typeof setting[whatVar] == 'number';
        if(!isVariableOkay) return;
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