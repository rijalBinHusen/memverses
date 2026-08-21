<script lang="ts">
    import { createEventDispatcher } from "svelte";
    export let arabicSize:number = 0;

    type varNumber = "arabicSize";

    function decrement(whatVar: varNumber) {
        //@ts-ignore
        if (typeof whatVar === "undefined" || setting[whatVar] == 1) return;
        //@ts-ignore
        arabicSize -= 1;
    }

    function increment(whatVar: varNumber) {
        if (typeof whatVar === "undefined") return;

        //@ts-ignore
        arabicSize += 1;
    }

    const dispatch = createEventDispatcher();

    function submitSetting() {
        dispatch("updateSetting", arabicSize);
    }
</script>

<div class="setting">
    
    <label for="arabic-size">Ukuran text arab</label>
    <div class="increment-decrement" id="arabic-size">
        <button on:click={() => decrement("arabicSize")}>-</button>
        <input bind:value={arabicSize} type="number" name="" id="" />
        <button on:click={() => increment("arabicSize")}>+</button>
        <span>Pixel</span>
    </div>
    <button class="primary-button" on:click={submitSetting}> Terapkan </button>
</div>

<style lang="scss">
    @import "SettingForm.scss";
</style>
