<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Folder, type FolderInterface} from "./Folder"
	const folderOperation = new Folder();

	// form operation
    export let folderInfo = {
        folderName: "",
        folderId: "",
    }

    // emit function
    const dispatch = createEventDispatcher();

	function handleSubmit() {
		if(folderInfo.folderName === "") return;
        dispatch("submitFolderForm", folderInfo)
	}
</script>

<section>
    <div class="form">
        <label for="nama-folder">Masukkan nama folder</label>
        <input bind:value={folderInfo.folderName} type="text" name="nama-folder" id="nama-folder">
        <button class="primary-button" on:click={handleSubmit}>{folderInfo.folderId ? 'Update' : 'Buat folder'}</button>
    </div>
</section>

<style lang="scss">
	@import "../../scss/form.scss";
</style>