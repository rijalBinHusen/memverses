<script lang="ts">
    import { onMount } from "svelte";
	import Seo from "../components/seo.svelte";
	import Modal from "../components/Modal.svelte";
	import { Folder, type FolderInterface } from "./Folder";

	let showModal = false;
	let currentMode: "chapter" | "custom-list" = "chapter";

	function toggleModal() {
		showModal = !showModal;
	}

	function switchMode(mode: "chapter" | "custom-list") {
		currentMode = mode;
	}

	let listFolder: FolderInterface[] = [];

	const folderOperation = new Folder();
	const retrieveFolder = folderOperation.getFolder();
	if (retrieveFolder) listFolder = retrieveFolder;

	// form operation
	let readingListName = "";
	let readingListId = "";

	function handleSubmit() {
		if (readingListName === "") return;

		if (readingListId) {
			folderOperation.updateFolder(readingListId, { name: readingListName });
		} else {
			folderOperation.createFolder(readingListName);
		}

		readingListName = ""; //empty the form
		readingListId = "";
		toggleModal(); // close modal
		listFolder = folderOperation.lists;
	}

	function editFolder(id: string) {
		const folderInfo = folderOperation.getFolderInfoById(id);
		if (typeof folderInfo === "undefined") return;

		readingListName = folderInfo.name;
		readingListId = folderInfo.id;
		toggleModal();
	}

	// verses list
	
    interface Chapter {
        nomor: number,
        nama_latin: string,
        jumlah_ayat: number
    }
	
	let listVersesAndInfo = <Chapter[]>[];

    async function getListVerses (): Promise<Chapter[]|undefined> {
        // retrieve on static json
        const retrieve = await fetch("/verses.static.json", { cache: "force-cache"});

        if(!retrieve) return;
        const data = await retrieve.json() as Chapter[];
        
        listVersesAndInfo = data;
    }

	
	let lastScrollTop = 0;

	function toggleNavbar() {

		const navbar = window.document.querySelector('.nav-container') as HTMLElement | null;

		if(navbar === null) return;
		let scrollTop = window.scrollY || document.documentElement.scrollTop;
		if (scrollTop > lastScrollTop) {

			navbar.style.bottom = "-80px";
		} else {

			navbar.style.bottom = "1rem";
		}
		lastScrollTop = scrollTop;
	}

    onMount(() => {
		window.addEventListener("scroll", toggleNavbar);
		getListVerses()
	});
</script>

<Seo
	title="Halaman utama"
	description="Halaman utama memverses"
/>

<section>

	{#if currentMode === "chapter"}
	<div>
	<!-- read quran by chapter -->
		<h1>Baca al-Quran</h1>
		<div>
			{#each listVersesAndInfo as chapter}
				<div class="folder">
					<a href={"/chapters?id=" + chapter.nomor + "&verse=1"}>
						{chapter.nomor} - {chapter.nama_latin} - {chapter.jumlah_ayat} ayat
					</a>
				</div>
			{/each}
		</div>
	<!-- end read quran by chapter -->
	</div>
	{:else}
		<!-- custom list -->
		<div>
			<h1>Daftar baca al-Quran</h1>

			<div>
				{#if listFolder.length}
					{#each listFolder as folder}
						<div class="folder">
							<a href={"/verses?id-folder=" + folder.id}>
								{folder.name}
							</a>
							<button on:click={() => editFolder(folder.id)}
								>Rename</button
							>
						</div>
					{/each}
				{:else}
					<div>Buat daftar baca baru, tekan tombol + dibawah :)</div>
				{/if}
			</div>
			<div class="bottom-nav">
				<button class="primary-button" on:click={toggleModal}>+</button>
			</div>
		</div>
	{/if}
	<div class="nav-container">
		<div class="nav-bar">
			<button 
				id="home-btn"
				on:click={() => switchMode("chapter")} 
				class={"nav-item nav-btn" + (currentMode === "chapter" ? " disabled" : "")}
			>
				Chapter
			</button>
			
			<button 
				on:click={() => switchMode("custom-list")} 
				class={"nav-item nav-btn" + (currentMode === "custom-list" ? " disabled" : "")}
			>
				Custom list
			</button>
		</div>
	</div>

	<!-- end of custom list -->
	<Modal
		on:closeModal={toggleModal}
		isOpen={showModal}
		title="Buat daftar baca baru"
	>
		<div class="form">
			<label for="nama-daftar-baca">Masukkan nama daftar baca</label>
			<input
				bind:value={readingListName}
				type="text"
				name="nama-daftar-baca"
				id="nama-daftar-baca"
			/>
			<button class="primary-button" on:click={handleSubmit}
				>{readingListId ? "Update" : "Buat"}</button
			>
		</div>
	</Modal>
</section>

<style lang="scss">
	@import "../scss/bottom-nav.scss";
	@import "./Folder/folder.scss";
	@import "../scss/primary-button.scss";
	@import "../scss/form.scss";
</style>
