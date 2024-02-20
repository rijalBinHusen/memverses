<script lang="ts">
	import Seo from '../../components/seo.svelte';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import Modal from '../../components/Modal.svelte';
    import { ChaptersOperation, type ChapterFormInterface, type VerseToShow } from './Chapter';
    import VersesForm from './ChapterForm.svelte';
    import { onMount } from 'svelte';
    import SettingForm from './SettingForm.svelte';
	import { type FolderUpdate, type FolderInterface, Folder } from "../Folder";
	import Chapter from './Verse.svelte';
    import { flip } from 'svelte/animate';

    let folderTitle = "";
	let folderInfo = <FolderInterface>{};
	let chapters = <VerseToShow[]>[];
    
    const chapterOperation = new ChaptersOperation();
    folderTitle = chapterOperation.retrieveTitleFolder();
	folderInfo = chapterOperation.getFolderInfo();

	let showModal = false;
	let currentForm = "";

	async function toggleModal(form?: 'setting'|'form') {
		showModal = !showModal;
		if(!form) currentForm = "";
		else currentForm = form;
	}

	function addVersesToMemorize(e: any) {

		const form = e.detail as ChapterFormInterface;
		for (let i = form.startVerse; i <= form.endVerse; i++) {
			
			chapterOperation.addChapter(form.chapter, i)
		}
		toggleModal();
		retrieveChapterToRead();
	}

	async function retrieveChapterToRead() {
		const data = await chapterOperation.getUnReadedVerse();
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

	function readChapter (e: any) {
		const chapterInfo = e.detail as { chap: number, verse: number }
		chapterOperation.readVerse(chapterInfo.chap, chapterInfo.verse)

		const findIndex = chapters.findIndex((chap) => chap.verse === chapterInfo.verse && chap.chapter === chapterInfo.chap);
		if(findIndex === -1) return;
		
		if(chapters.length > 1) {
			
			const allChapter = [...chapters];
			allChapter.splice(findIndex, 1);
			chapters = allChapter;
		} else {
			
			retrieveChapterToRead();
		}
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
		<h1>{folderTitle}</h1>
		<span>
			<button on:click={ () => toggleModal('setting')}>&#9881;</button>
		</span>
	</div>

	<div class="wraper">
		{#if chapters.length}
		
			{#each chapters as chapt (chapt)}
				<div animate:flip>
					<Chapter
						chapter={chapt}
						arabicSize={folderInfo.arabicSize}
						showTafseer={folderInfo.showTafseer}
						on:readed={readChapter}
					/>
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
	@import "./chapter.scss";
</style>
