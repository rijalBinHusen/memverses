<script lang="ts">
	import Seo from '../components/seo.svelte';
	import Modal from '../components/Modal.svelte';
	import { Folder, type FolderInterface } from "./index/Folder";
	import FolderForm from './index/FolderForm.svelte';
	import Account from './index/Account.svelte';
	import { env } from '$env/dynamic/public';
    import { isResponseFromFetch, requestToServer } from '../scipts/fetch';

	const hostURL = "http://" + env.PUBLIC_HOST_URL + "/" ;

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
			modalTitle: "Akun anda" 
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

	async function handleUserRegister(e: any) {
	
		const userInfo = e.detail as { username: string, password: string, email: string };
		const isUserInfoInvalid = userInfo.username == "" || userInfo.password == "" || userInfo.email == "";
		if(isUserInfoInvalid) {
			alert("Form tidak boleh ada kosong")
			return;
		}

		const dataToPost = JSON.stringify(userInfo)
        try {
            
            const register = await requestToServer( hostURL + "memverses/user/register", "POST", dataToPost)
            if(isResponseFromFetch(register)) {
                if(register.status === 200) {
					modalInfo = {
						isModalShow: false,
						isFolderForm: false,
						modalTitle: ""
					};			
				}

                else {
                    const response = await register.json();
                    throw (response?.message)
                }
            }

            throw ("Terjadi kesalahan saat terhubung dengan server")
        } catch (error) {
            alert(error)
        }
	}
	
	async function handleUserLogin(e: any) {
		 console.log(e)
		const userInfo = e.detail as { password: string, email: string };
		const isUserInfoInvalid =  userInfo.password == "" || userInfo.email == "";
		if(isUserInfoInvalid) {
			alert("Form tidak boleh ada kosong")
			return;
		}

		const dataToPost = JSON.stringify(userInfo)
        try {
            
            const register = await requestToServer( hostURL + "memverses/user/login", "POST", dataToPost)
            if(isResponseFromFetch(register)) {
                if(register.status === 200) {
					modalInfo = {
						isModalShow: false,
						isFolderForm: false,
						modalTitle: ""
					};			
				}

                else {
                    const response = await register.json();
                    throw (response?.message)
                }
            }

            throw ("Terjadi kesalahan saat terhubung dengan server")
        } catch (error) {
            alert(error)
        }
	}

	renewFolderList()

</script>

<Seo 
	title="Halaman utama" 
	description="Halaman utama aplikasi menghafal alquran"
/>

<section>
	<div class="header-title-page">
		<h1>Hafal al-Quran</h1>
		<span>
			<button on:click={showModalAccount}>&#9881;</button>
		</span>
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
			<Account 
				on:register={handleUserRegister}
				on:login={handleUserLogin}
			/>
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
</style>
