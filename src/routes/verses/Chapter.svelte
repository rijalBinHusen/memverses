<script lang="ts">
	import Seo from '../../components/seo.svelte';
	import Modal from '../../components/Modal.svelte';
    import { ChaptersOperation, type ChapterFormInterface, type VerseToShow } from './Chapter';
    import VersesForm from './ChapterForm.svelte';
    import { onMount } from 'svelte';
    import SettingForm from './SettingForm.svelte';
	import { type FolderUpdate, type FolderInterface, Folder } from "../index/Folder";
	import Chapter from './Verse.svelte';
    import { flip } from 'svelte/animate';

    let folderTitle = "";
	let folderInfo = <FolderInterface>{};
	let folderList = <FolderInterface[]|undefined>[];
	let chapters = <VerseToShow[]>[];
	let messageToShow = "";
    
    const chapterOperation = new ChaptersOperation();
	
    folderTitle = "";
	let showModal = false;
	let currentForm = "";

	async function toggleModal(form?: 'setting'|'form') {
		showModal = !showModal;
		if(!form) currentForm = "";
		else currentForm = form;
	}

	function addVersesToMemorize(e: any) {

		const form = e.detail as ChapterFormInterface;
		chapterOperation.addChapter(form.chapter, form.startVerse, form.endVerse)
		toggleModal();
		retrieveChapterToRead();
	}

	async function retrieveChapterToRead() {
		// empty the chpaters
		chapters = [];
		const data = await chapterOperation.getUnReadedVerse();
		messageToShow = `Ayat akan muncul dalam ${folderInfo.show_next_chapter_on_second} detik...`;
		
		if(data == undefined) {
			messageToShow = "Tidak ayat untuk dibaca, tekan tombol + dibawah :)";
			return;
		}
			
		await new Promise((resolve) => {
			setTimeout(() => {
				resolve("")
			}, folderInfo.show_next_chapter_on_second * 1000);
		})
		// fill the chapters
		chapters = data;
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

	function moveToFolder(e: any) {
		const verseInfo = e.detail as {idFolder: string, idVerse: number};
		
		chapterOperation.moveVerseToFolder(verseInfo.idVerse, verseInfo.idFolder);

		retrieveChapterToRead();
	}

	async function readChapter (e: any) {
		const id = e.detail as string
		await chapterOperation.readVerse(id);

		const findIndex = chapters.findIndex((chap) => chap.id === id);
		if(findIndex === -1) return;
		
		if(chapters.length > 1) {
			
			const allChapter = [...chapters];
			allChapter.splice(findIndex, 1);
			chapters = allChapter;
		} else {
			
			retrieveChapterToRead();
		}
	}

	onMount(() => {
		retrieveChapterToRead();
		chapterOperation.retrieveTitleFolder().then((res) => {
			console.log(res)
			folderTitle = res
			folderInfo = chapterOperation.getFolderInfo();
			folderList = chapterOperation.getFoldersList();
		});
	})


</script>

<Seo 
	title="Hafalan surah alquran" 
	description="Daftar surah alquran untuk dihafalkan"
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
						verse={chapt}
						arabicSize={folderInfo.arabic_size}
						showTafseer={folderInfo.is_show_tafseer}
						on:readed={readChapter}
						folderList={folderList}
						on:move={moveToFolder}
					/>
				</div>
			{/each}
			
		{:else}
		 	<div>{ messageToShow }</div>
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
