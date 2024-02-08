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
		{
			listFolder.length ?
		 	listFolder.toString()
		 	: "Buat folder baru, tekan tombol + dibawah :)"
		}
	</div>
	<div class="button-wraper">
		<button on:click={toggleModal}>+</button>
	</div>
	<Modal
		on:closeModal={toggleModal} 
		isOpen={showModal} 
		title="Buat folder baru"
	>
		<div>
			<label for="nama-folder">Masukkan nama folder</label>
			<input type="text" name="nama-folder" id="nama-folder">
			<button>Buat</button>
		</div>
	</Modal>
</section>

<style>

	.button-wraper {
		display: flex;
		position: fixed;
		bottom: 1rem;
		justify-content: end;
		width: 100%;
		padding-right: 2rem;
	}
 
	.button-wraper button {
		width: 3rem;
		height: 3rem;
		/* background-color: rgb(174, 78, 243); */
		background-color: var(--color-theme-1);
		cursor: pointer;
		font-weight: bolder;
		font-size: x-large;
		border-radius: .5rem;
		border: 3px solid black;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
