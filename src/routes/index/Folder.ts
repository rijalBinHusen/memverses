import { isResponseFromFetch, requestToServer } from "../../scipts/fetch"

export interface FolderInterface {
    id: string,
    name: string,
    total_verse_to_show: number,
    show_next_chapter_on_second: number,
    read_target: number,
    is_show_first_letter: true,
    is_show_tafseer: true,
    arabic_size: number,
    changed_by: string
}

interface FolderServerResponse {
    success: boolean,
    data: FolderInterface[]
  }

export type FolderUpdate = {
    [K in keyof FolderInterface]?:  FolderInterface[K];
  }

export class Folder {

    lists = <FolderInterface[]>[];

    async getFolder(): Promise<FolderInterface[]|void> {
        if(typeof window == undefined) return;
        let folders = <FolderInterface[]>[];
        const getFolder = await requestToServer("memverses/folders", "GET", "");
        
        if(isResponseFromFetch(getFolder)) {
            const responseJSON = await getFolder.json() as FolderServerResponse;
            if(getFolder.status === 200) {
                for(let folder of responseJSON.data) {
                    folders.push({
                        arabic_size: folder.arabic_size,
                        id: folder.id,
                        name: folder.name,
                        show_next_chapter_on_second: folder.show_next_chapter_on_second,
                        read_target: folder.read_target,
                        is_show_first_letter: folder.is_show_first_letter,
                        is_show_tafseer: folder.is_show_tafseer,
                        total_verse_to_show: folder.total_verse_to_show,
                        changed_by: ""
                    })
                }
            }

            else {
                alert(getFolder)
                return;
            }
        }

        this.lists = folders;
        return folders;
    }

    async createFolder(name: string){
        
        const dataToSendToBackend = {
            name,
            total_verse_to_show: 5,
            show_next_chapter_on_second: 1,
            read_target: 1,
            is_show_first_letter: false,
            is_show_tafseer: false,
            arabic_size: 30
        }
        
        const createFolder = await requestToServer("memverses/folder", "POST", JSON.stringify(dataToSendToBackend));
        if(isResponseFromFetch(createFolder)) {
            if(createFolder.status != 201) alert(createFolder);
        }
    }

    updateFolder(id: string, keyValue: FolderUpdate) {
        
        const dataToSendToBackend:any = {};

        if(keyValue.name) dataToSendToBackend.name = keyValue.name;
        if(keyValue.total_verse_to_show) dataToSendToBackend.total_verse_to_show = keyValue.total_verse_to_show;
        if(keyValue.show_next_chapter_on_second) dataToSendToBackend.show_next_chapter_on_second = keyValue.show_next_chapter_on_second;
        if(keyValue.read_target) dataToSendToBackend.read_target = keyValue.read_target;
        if(keyValue.is_show_first_letter) dataToSendToBackend.is_show_first_letter = keyValue.is_show_first_letter;
        if(keyValue.is_show_tafseer) dataToSendToBackend.is_show_tafseer = keyValue.is_show_tafseer;
        if(keyValue.arabic_size) dataToSendToBackend.arabic_size = keyValue.arabic_size;
        
        
        requestToServer("memverses/folder/" + id , "PUT", JSON.stringify(dataToSendToBackend));
    }

    async getFolderInfoById(id: string): Promise<FolderInterface|undefined> {
        
        
        let folders = <FolderInterface[]>[];
        if(!this.lists.length) {

            const getFolders = await this.getFolder();
            if(!getFolders) return;
            folders = getFolders;
        }

        const findIndex = folders.findIndex((folder) => folder.id === id)
        if(findIndex < 0) return;

        return folders[findIndex];
    }

    getListFolderExcept(idFolder: string): FolderInterface[]|undefined {
        const filters = this.lists.filter((fold) => fold.id !== idFolder);

        if(filters.length) return filters;
    }
}