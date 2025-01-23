import { isResponseFromFetch, requestToServer } from "../../scipts/fetch"

export interface FolderInterface {
    id: string,
    id_user: string,
    name: string,
    total_verse_to_show: number,
    show_next_chapter_on_second: number,
    read_target: number,
    is_show_first_letter: boolean,
    is_show_tafseer: boolean,
    arabic_size: number,
    changed_by: string
    is_changed_by_other_devices: boolean
}

interface FolderServerResponse {
    success: boolean,
    data: FolderInterface[]
}

export type FolderUpdate = {
    [K in keyof FolderInterface]?: FolderInterface[K];
}

export class Folder {

    lists = <FolderInterface[]>[];
    #storageName = "memverses_folder"

    async getFolder(): Promise<FolderInterface[] | void> {
        if (typeof window === 'undefined') return;

        if (this.lists.length) return this.lists;

        if (this.isUserOnline()) {
            await this.getFolderFromBackEnd();
            return this.lists;
        }

        else {

            const retrieveFolder = window.localStorage.getItem(this.#storageName);

            if (retrieveFolder === null) return

            const folderParsed: FolderInterface[] = JSON.parse(retrieveFolder)
            this.lists = folderParsed;
            return folderParsed;
        }
    }

    async createFolderAndFetchData(name: string) {
        const dataToSend = {
            name,
            total_verse_to_show: 5,
            show_next_chapter_on_second: 1,
            read_target: 1,
            is_show_first_letter: false,
            is_show_tafseer: false,
            arabic_size: 30,
        };

        try {
            const postData = await requestToServer("memverses/folder", "POST", JSON.stringify(dataToSend));
            if (isResponseFromFetch(postData)) {
                const data = await postData.json();
                if (postData.status != 201) {
                    throw "Error while create data on backend " + data
                } else {
                    await this.getFolderFromBackEnd();
                }
            }
        } catch (error) {
            alert(error);
            return false
        }

    }

    async updateFolder(id: string, keyValue: FolderUpdate) {
        if (!this.lists.length) await this.getFolder();
        const findIndex = this.lists.findIndex((folder) => folder.id === id);
        if (findIndex < 0) return;

        this.lists[findIndex] = { ...this.lists[findIndex], ...keyValue };
        this.saveToLocalStorage();

        try {
            const postData = await requestToServer("memverses/folder/" + id, "PUT", JSON.stringify(keyValue));
            if (isResponseFromFetch(postData)) {
                const data = await postData.json();
                if (postData.status > 201) {
                    throw "Error while update data on backend " + data
                }
            }
        } catch (error) {
            alert(error);
            return false
        }
    }

    saveToLocalStorage() {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(this.#storageName, JSON.stringify(this.lists));
    }

    async getFolderInfoById(id: string): Promise<FolderInterface | undefined> {

        let folders = this.lists;
        if(!this.lists.length) {

            const getFolders = await this.getFolder();
            if (!getFolders) return;
            folders = getFolders
        }

        const findIndex = folders.findIndex((folder) => folder.id === id)
        if (findIndex < 0) return;

        return folders[findIndex];
    }

    getListFolderExcept(idFolder: string): FolderInterface[] | undefined {
        const filters = this.lists.filter((fold) => fold.id !== idFolder);

        if (filters.length) return filters;
    }

    async getFolderFromBackEnd(): Promise<false | void> {
        this.lists = [];

        try {
            const getFolder = await requestToServer("memverses/folders", "GET", "");

            if (isResponseFromFetch(getFolder)) {
                const responseJSON = await getFolder.json() as FolderServerResponse;
                if (getFolder.status === 200) {
                    this.lists = responseJSON.data;
                    this.saveToLocalStorage();
                } else {
                    throw "Error while fetching data to backend" + responseJSON
                }
            }
        } catch (error) {

            alert(error)
            return;
        }
    }

    private isUserOnline(): boolean {
        return window.navigator.onLine;
    }
}