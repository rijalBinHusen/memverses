<script lang="ts">
	import Seo from '../components/seo.svelte';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import Modal from '../components/Modal.svelte';
	import { Folder, type FolderInterface } from "./Folder";

	let showModal = false;

	function toggleModal() {
		showModal = !showModal;
	}

	let listFolder:FolderInterface[] = [];
	
	const folderOperation = new Folder();
	const retrieveFolder = folderOperation.getFolder();
	if(retrieveFolder) listFolder = retrieveFolder;

	// form operation
	let folderName = "";
	function createFolder() {
		if(folderName === "") return;

		folderOperation.createFolder(folderName);
		folderName = "" //empty the form
		toggleModal() // close modal
		listFolder = folderOperation.lists
	}

</script>

<Seo 
	title="Halaman utama" 
	description="Halaman utama kita" 
	link="localhost:3000" 
	thumbnail={welcome_fallback}
/>

<section>
	<h1>Hafal al-Quran</h1>

	<div>
		{#if listFolder.length}
		
			{#each listFolder as folder}
				<a href={'/verses?id-folder='+folder.id} class="folder">
					{folder.name} <button>Edit</button>
				</a>

			{/each}
			
		{:else}
		 	<div>Buat folder baru, tekan tombol + dibawah :)</div>
		{/if}
	</div>
	<div class="bottom-nav">
		<button class="primary-button" on:click={toggleModal}>+</button>
	</div>
	<Modal
		on:closeModal={toggleModal} 
		isOpen={showModal} 
		title="Buat folder baru"
	>
		<div class="form">
			<label for="nama-folder">Masukkan nama folder</label>
			<input bind:value={folderName} type="text" name="nama-folder" id="nama-folder">
			<button class="primary-button" on:click={createFolder}>Buat folder</button>
		</div>
	</Modal>
</section>

<style lang="scss">
	@import "../scss/bottom-nav.scss";
	@import "./Folder/folder.scss";
	@import "../scss/primary-button.scss";
	@import "../scss/form.scss"
</style>
