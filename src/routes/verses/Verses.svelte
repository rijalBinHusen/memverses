<script lang="ts">
	import Seo from '../../components/seo.svelte';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import Modal from '../../components/Modal.svelte';

	let showModal = false;

	function toggleModal() {
		showModal = !showModal;
	}

</script>

<Seo 
	title="Hafalan surah alquran" 
	description="Daftar surah alquran untuk dihafalkan" 
	link="localhost:3000" 
	thumbnail={welcome_fallback}
/>

<section>
	<h1>Hello verses</h1>

	<div>
		<!-- {#if listFolder.length}
		
			{#each listFolder as folder}
				<div class="folder">
					{folder.name} <button>Edit</button>
				</div>

			{/each}
			
		{:else}
		 	<div>Buat folder baru, tekan tombol + dibawah :)</div>
		{/if} -->
	</div>
	<div class="bottom-nav">
		<button on:click={toggleModal}>+</button>
	</div>
	<Modal
		on:closeModal={toggleModal} 
		isOpen={showModal} 
		title="Buat folder baru"
	>
		<!-- <div>
			<label for="nama-folder">Masukkan nama folder</label>
			<input bind:value={folderName} type="text" name="nama-folder" id="nama-folder">
			<button on:click={createFolder}>Buat</button>
		</div> -->
	</Modal>
</section>

<style lang="scss">
	@import "../../scss/bottom-nav.scss";
</style>
