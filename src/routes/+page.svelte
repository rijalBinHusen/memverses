<script lang="ts">
	import Seo from '../components/seo.svelte';
	import Modal from '../components/Modal.svelte';
	import { Folder, type FolderInterface } from "./index/Folder";
	import FolderForm from './index/FolderForm.svelte';
	import Account from './index/Account.svelte';
	
    import { isResponseFromFetch, requestToServer } from '../scipts/fetch';
    import { onMount } from 'svelte';

	let modalInfo = {
		isModalShow: false,
		isFolderForm: false,
		modalTitle: "",
	}

	function toggleModal() {
		modalInfo.isModalShow = !modalInfo.isModalShow;
	}

	function showModalFolderForm () {
		modalInfo = {
			isModalShow: true,
			isFolderForm: true,
			modalTitle: `${currentFolderInfo.folderId ? 'Update' : 'Buat'} Folder` 
		}
	}

	function showModalAccount () {
		modalInfo = {
			isModalShow: true,
			isFolderForm: false,
			modalTitle: "Login" 
		}
	}

	interface FolderInfo { folderId: string, folderName: string }
	let currentFolderInfo = <FolderInfo>{
		folderName: "",
		folderId: ""
	}

	let listFolder:FolderInterface[] = [];
	
	const folderOperation = new Folder();

	function renewFolderList () {

		const retrieveFolder = folderOperation.getFolder();
		if(retrieveFolder) listFolder = retrieveFolder;
	}

	function handleEditFolder(id:string) {
		const folderInfo = folderOperation.getFolderInfoById(id);
		if(typeof folderInfo === "undefined") return;

		currentFolderInfo.folderName = folderInfo.name;
		currentFolderInfo.folderId = folderInfo.id;
		showModalFolderForm();
	}

	function handleSubmitFolder(e: any) {
	
		const folderInfo = e.detail as FolderInfo;
		if(folderInfo.folderId) folderOperation.updateFolder(folderInfo.folderId, { name: folderInfo.folderName })
		else folderOperation.createFolder(folderInfo.folderName);

		currentFolderInfo.folderName = "";
		currentFolderInfo.folderId = "";
		toggleModal();
		renewFolderList()
	}
	
	async function catchGoogleCodeAccess() {
		const query = window.location.search
		if(!query) return;
		const split = query.split("=")
		
		if(split.length < 2) return;
		if(split[0]  != "?code") return;
		// set token
		await requestToServer(`google/get_access_token?code=`+ encodeURIComponent(split[1]), "GET", "");
		localStorage.setItem("isLogin", "1");
		window.location.replace(window.location.origin);
	}

	interface googleUserInfo {
		success: boolean,
		data: {
			email: string,
			name: string,
			profile_picture: string
		}
	}

	let googleUserInfoLoggedIn = {
			email: "",
			name: "",
			profile_picture: ""
		};

	async function getUserInfo() {
		const isLogin = localStorage.getItem("isLogin");
		if(isLogin != "1") return;
		const userInfo = await requestToServer(`google/get_user_info`, "GET", "");
		if(isResponseFromFetch(userInfo)) {
			if(userInfo.status === 200) {
				const userInfoData = await userInfo.json() as googleUserInfo;
				if(!userInfoData.success) return;
				googleUserInfoLoggedIn = userInfoData.data;
				await folderOperation.sendLocalFolderToServer();
			}
			else {
				localStorage.setItem("isLogin", "0");
			}
		}
	}
	
	onMount(async () => {
		catchGoogleCodeAccess()
		getUserInfo();
	})

	renewFolderList()

</script>

<Seo 
	title="Halaman utama" 
	description="Halaman utama aplikasi menghafal alquran"
/>

<section>
	<div class="header-title-page">
		<h1>Hafal al-Quran</h1>
		<div class="account-info">
			{#if googleUserInfoLoggedIn.email !== ""}
			<span>{googleUserInfoLoggedIn.name}</span>	
			<!-- <img src={googleUserInfoLoggedIn.profile_picture} alt="pict" srcset=""> -->
			{:else}
			<button on:click={showModalAccount}>&#9881;</button>
			{/if}
		</div>
	</div>
	<div>
		{#if listFolder.length}
		
			{#each listFolder as folder}
			<div class="folder">

				<a href={'/verses?id-folder='+folder.id}>
					{folder.name} 
				</a>
				<button on:click={() => handleEditFolder(folder.id)}>Edit</button>
			</div>

			{/each}
			
		{:else}
		 	<div>Buat folder baru, tekan tombol + dibawah :)</div>
		{/if}
	</div>
	<div class="bottom-nav">
		<button class="primary-button" on:click={showModalFolderForm}>+</button>
	</div>
	<Modal
		on:closeModal={toggleModal} 
		isOpen={modalInfo.isModalShow} 
		title={modalInfo.modalTitle}
	>
		{#if modalInfo.isFolderForm}
			<FolderForm 
				folderInfo={currentFolderInfo}
				on:submitFolderForm={handleSubmitFolder}
			/>
		{:else}
			<Account />
		{/if}
	</Modal>
</section>

<style lang="scss">
	@import "../scss/bottom-nav.scss";
	@import "./index/folder.scss";
	@import "../scss/primary-button.scss";


	.header-title-page {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-title-page button {
		background-color: $secondary-color;
		// padding: .2rem .4rem .2rem .4rem;
		border: 1px solid $primary-color;
		color: $primary-color;
		font-weight: bolder;
		cursor: pointer;
		font-size: x-large;
		border-radius: 50%;
	}

	.account-info {
		display: flex;
		align-items: center;

		img	{
			height: 35px;
			border-radius: 50%;
			margin-left: 5px;
			box-shadow: 0 2px 10px -3px #333;
		}
	}
</style>
