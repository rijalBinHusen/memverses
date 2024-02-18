<script lang="ts">
	import Seo from '../../components/seo.svelte';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import Modal from '../../components/Modal.svelte';
    import { VersesOperation, type VersesFormInterface, type ChapterToShow } from './verses';
    import VersesForm from './VersesForm.svelte';
    import { onMount } from 'svelte';
    import SettingForm from './SettingForm.svelte';
	import { type FolderUpdate, type FolderInterface, Folder } from "../Folder";

    let folderTitle = "";
	let folderInfo = <FolderInterface>{};
	let chapters = <ChapterToShow[]>[];
    
    const versesOperation = new VersesOperation();
    folderTitle = versesOperation.retrieveTitleFolder();
	folderInfo = versesOperation.getFolderInfo();

	let showModal = false;
	let currentForm = "";

	async function toggleModal(form?: 'setting'|'form') {
		showModal = !showModal;
		if(!form) currentForm = "";
		else currentForm = form;
	}

	function addVersesToMemorize(e: any) {

		const form = e.detail as VersesFormInterface;
		for (let i = form.startChapter; i <= form.endChapter; i++) {
			
			versesOperation.addVerses(form.verse, i)
		}
		toggleModal();
		retrieveChapterToRead();
	}

	async function retrieveChapterToRead() {
		const data = await versesOperation.getUnReadedChapter();
		if(data) chapters = data;
	}

	function updateFolderSetting(e: any) {
		const settingInfo = e.detail as FolderUpdate;
		const folderOperation = new Folder();
		if(!folderInfo.id) return;
		
		folderOperation.updateFolder(folderInfo.id, settingInfo);
		folderInfo = { ...folderInfo, ...settingInfo};

		toggleModal();
		retrieveChapterToRead();
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
	<div class="setting-btn">
		<button on:click={ () => toggleModal('setting')}>&#9881;</button>
	</div>
	<h1>{folderTitle}</h1>

	<div>
		{#if chapters.length}
		
			{#each chapters as chapter}
				<div class="chapter">
					<div class="arabic" style={'font-size:'+ folderInfo.arabicSize + 'px'}>

						{ chapter.showFirstLetter
							? chapter.arabic.slice(0, 10)
							: chapter.arabic
						}
					</div>
					<div class="translation">
						{chapter.translate}
					</div>
					{#if folderInfo.showTafseer }
						
						<div class="tafsir">
							{chapter.tafsir}
						</div>
					{/if}
					<div class="navigation">
						Readed: {chapter.readed}
						<button class="move">
							Pindahkan
						</button>
						<button>Read</button>
					</div>
				</div>

			{/each}
			
		{:else}
		 	<div>Tidak ayat untuk dibaca, tekan tombol + dibawah :)</div>
		{/if}
	</div>
	<div class="bottom-nav">
		<button on:click={ () => toggleModal('form')}>+</button>
	</div>
	<Modal
		on:closeModal={ () => toggleModal()} 
		isOpen={showModal} 
		title={currentForm === 'setting' ? 'Setting' : 'Tambahkan ayat'}
	>
		{#if currentForm === 'setting'}
			<SettingForm 
				setting={folderInfo}
				on:updateSetting={updateFolderSetting}
			/>
		{:else}
		<VersesForm 
			on:verseAndChapterSubmitted={addVersesToMemorize}
		/>
		{/if}
	</Modal>
</section>

<style lang="scss">
	@import "../../scss/bottom-nav.scss";
	@import "./verses.scss";
</style>
