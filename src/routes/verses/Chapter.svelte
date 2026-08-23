<script lang="ts">
	import Seo from "../../components/seo.svelte";
	import Modal from "../../components/Modal.svelte";
	import {
		ChaptersOperation,
		type ChapterFormInterface,
		type VerseToShow,
	} from "./Chapter";
	import VersesForm from "./ChapterForm.svelte";
	import { onMount } from "svelte";
	import SettingForm from "./SettingForm.svelte";
	import MoveFolderForm from "./MoveFolderForm.svelte";
	import { type FolderUpdate, type FolderInterface, Folder } from "../Folder";
	import VerticalFeed from "../chapters/VerticalFeed.svelte";
	import ChapterBtn from "./Chapter-btn.svelte";

	let folderTitle = "";
	let folderInfo = <FolderInterface>{};
	let folderList = <FolderInterface[] | undefined>[];
	let chapters = <VerseToShow[]>[];
	let messageToShow = "Tidak ayat untuk dibaca, tekan tombol + dibawah :)";

	const chapterOperation = new ChaptersOperation();
	folderTitle = chapterOperation.retrieveTitleFolder();
	folderInfo = chapterOperation.getFolderInfo();
	folderList = chapterOperation.getFoldersList();

	let showModal = false;
	let currentForm = "";

	let currentVerseId:undefined|number;
	let oldVerseId:undefined|number;

	async function toggleModal(form?: "setting" | "form" | "move") {
		const isOnlyOneFolderAndFormMove = form === "move" && (!folderList || folderList?.length == 0);
		
		if(isOnlyOneFolderAndFormMove) {
			alert("Total folder hanya 1");
			return;
		}
		showModal = !showModal;
		if (!form) currentForm = "";
		else currentForm = form;
	}

	function addVersesToMemorize(e: any) {
		const form = e.detail as ChapterFormInterface;
		chapterOperation.addChapter(
			form.chapter,
			form.startVerse,
			form.endVerse,
		);
		toggleModal();
		retrieveChapterToRead();
	}

	async function retrieveChapterToRead() {
		chapters = [];
		const data = await chapterOperation.getUnReadedVerse();

		if (data) {
			messageToShow = `Ayat akan muncul dalam ${folderInfo.nextChapterOnSecond} detik...`;
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve("");
				}, folderInfo.nextChapterOnSecond * 1000);
			});
			chapters = data;
		}

		if (!chapters.length) {
			messageToShow =
				"Tidak ayat untuk dibaca, tekan tombol + dibawah :)";
		}
	}

	function updateFolderSetting(e: any) {
		const settingInfo = e.detail as FolderUpdate;
		const folderOperation = new Folder();
		if (!folderInfo.id) return;

		folderOperation.updateFolder(folderInfo.id, settingInfo);
		folderInfo = { ...folderInfo, ...settingInfo };

		toggleModal();
		retrieveChapterToRead();
	}

	function getVerseId(): number|undefined {
		if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
		const folderId = params.get('id-folder'); // folder id
		const chaptersId = params.get('id'); // chapter id
        const verseNumber = params.get('verse'); // verse number
		const findIndex = chapters.findIndex((rec) => rec.idFolder == folderId && rec.chapter == Number(chaptersId) && rec.verse == Number(verseNumber))

		return chapters[findIndex]?.id;
	}

	function moveToFolder(e: any) {
		
        if (typeof window === "undefined") return;
		const idFolderDestination = e.detail as string
		const verseId = getVerseId();

		if(verseId) {
			chapterOperation.moveVerseToFolder(
				verseId,
				idFolderDestination,
			);
			retrieveChapterToRead();
		}

		toggleModal();
	}

	function readChapter(verseId: number) {
		if(verseId) chapterOperation.readVerse(verseId);
	}

	async function copyCurrentUrl() {
		try {
			const fullURL = new URL(window.location.href);
			// Update the path
			fullURL.pathname = "/chapters";

			// Remove the unwanted query parameter
			fullURL.searchParams.delete("id-folder");

			await navigator.clipboard.writeText(fullURL.toString());
			alert('URL copied to clipboard!');
			return true;
		} catch (err) {
			console.error('Failed to copy URL: ', err);
			return false;
		}
	}

	function updateVerseURLParams(chapter: number, verse: number) {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
		params.set('id', chapter.toString());
        params.set('verse', verse.toString());
        window.history.pushState({ verse }, '', `${window.location.pathname}?${params.toString()}`);

		oldVerseId = currentVerseId;
		if(oldVerseId) {
			readChapter(oldVerseId);
		}
		currentVerseId = getVerseId();
    }

	function deleteVerse() {
        if (typeof window === "undefined") return;

		const confirm = window.confirm("Apakah anda yakin untuk hapus ayat");
		const verseId = getVerseId();
		if(!confirm || !verseId) return;
		
		chapterOperation.removeVerse(verseId)
		retrieveChapterToRead()
	}

	onMount(() => retrieveChapterToRead());
</script>

<Seo
	title="Hafalan surah alquran"
	description="Daftar surah alquran untuk dihafalkan"
/>

<section>
	<div class="setting-btn">
		<h1>{folderTitle}</h1>
		<span>
			<button on:click={() => toggleModal("setting")}>&#9881;</button>
		</span>
	</div>

	<div class="wraper">
		{#if chapters.length}
			<VerticalFeed 
				items={chapters}  
				currentIndex={0} 
				onSwitchVerse={updateVerseURLParams} 
				onGetNewVerses={retrieveChapterToRead} 
				arabicSize={folderInfo.arabicSize}
			>
				<ChapterBtn 
					slot="right-btn" 
					onAddVerse={() => toggleModal("form")}
					onDelete={() => deleteVerse()}
					onMoveTo={() => toggleModal("move")}
					onShare={() => copyCurrentUrl()}
				/>
			</VerticalFeed>
		{:else}
			<div style="margin-top:5rem">{messageToShow}</div>
			<div class="bottom-nav">
				<button on:click={() => toggleModal("form")}>+</button>
			</div>
		{/if}
	</div>
	<Modal
		on:closeModal={() => toggleModal()}
		isOpen={showModal}
		title={currentForm === "setting" ? "Setting" : "Tambahkan ayat"}
	>
		{#if currentForm === "setting"}
		<SettingForm
				setting={folderInfo}
				on:updateSetting={updateFolderSetting}
			/>
		{:else if currentForm === "move"}
			<MoveFolderForm 
				folderList={folderList}
				on:idFolderSubmitted={moveToFolder}
			/>
		{:else}
			<VersesForm on:verseAndChapterSubmitted={addVersesToMemorize} />
		{/if}
	</Modal>
</section>

<style lang="scss">
	@import "../../scss/bottom-nav.scss";
	@import "./chapter.scss";
</style>
