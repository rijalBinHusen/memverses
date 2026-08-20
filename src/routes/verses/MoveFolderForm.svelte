<style lang="scss">
    @import "../../scss/form.scss";
    .primary-button {
        margin-top: 1rem;
    }
</style>

<div class="form">
    <label for="list-verses">Pilih folder</label>
    <select bind:value={folderId} name="list-verses" id="list-verses">
        {#each folderList as folder}
            <option value={folder.id}>{folder.id} - {folder.name} </option>
        {/each}
    </select>

    <button class="primary-button" on:click={submitIdFolder}>Pindahkan</button>
</div>

<script lang="ts">
    import { createEventDispatcher, } from "svelte";
    import { type FolderInterface } from "../Folder";

    export let folderList = <FolderInterface[]>[];
    let folderId = 0;

    const dispatch = createEventDispatcher();

    function submitIdFolder() {
        console.log(folderId)
        dispatch("verseAndChapterSubmitted", folderId)
    }

</script>