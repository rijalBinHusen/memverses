<script lang="ts">
	import Seo from '../../components/seo.svelte';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import Modal from '../../components/Modal.svelte';
    import { VersesOperation, type VersesFormInterface, type ChapterToShow } from './verses';
    import VersesForm from './VersesForm.svelte';
    import { onMount } from 'svelte';

    let folderTitle = "";
	let chapters = <ChapterToShow[]>[];
    
    const versesOperation = new VersesOperation();
    folderTitle = versesOperation.retrieveTitleFolder();

	let showModal = false;

	async function toggleModal() {
		showModal = !showModal;
	}

	function addVersesToMemorize(e: any) {

		const form = e.detail as VersesFormInterface;
		for (let i = form.startChapter; i <= form.endChapter; i++) {
			
			versesOperation.addVerses(form.verse, i)
		}
		toggleModal();
	}

	async function retrieveChapterToRead() {
		const data = await versesOperation.getUnReadedChapter(5);
		if(data) chapters = data;
	}

	onMount(() => retrieveChapterToRead())


</script>

<Seo 
	title="Hafalan surah alquran" 
	description="Daftar surah alquran untuk dihafalkan" 
	link="localhost:3000" 
	thumbnail={welcome_fallback}
/>

<section>
	<h1>{folderTitle}</h1>

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
		<div>{JSON.stringify(chapters)}</div>
	</div>
	<div class="bottom-nav">
		<button on:click={toggleModal}>+</button>
	</div>
	<Modal
		on:closeModal={toggleModal} 
		isOpen={showModal} 
		title="Tambahkan surah atau ayat"
	>
		<VersesForm 
			on:verseAndChapterSubmitted={addVersesToMemorize}
		/>
	</Modal>
</section>

<style lang="scss">
	@import "../../scss/bottom-nav.scss";
</style>
