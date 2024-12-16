import { isResponseFromFetch, requestToServer } from "../../scipts/fetch"
import { ChaptersOperation } from "../verses/Chapter"

export interface FolderInterface {
    id: string
    name: string
    verseToShow: number
    nextChapterOnSecond: number
    readTarget: number
    showFirstLetter: boolean
    showTafseer: boolean
    arabicSize: number
    isShowRandomVerse: boolean
}

export type FolderUpdate = {
    [K in keyof FolderInterface]?:  FolderInterface[K];
  }

export class Folder {

    #storageName = "memorize-quran";
    lists = <FolderInterface[]>[];

    getFolder(): FolderInterface[]|void {
        if(typeof window === 'undefined') return;
        const retrieveFolder = window.localStorage.getItem(this.#storageName);

        if(retrieveFolder === null) return

        const folderParsed: FolderInterface[] = JSON.parse(retrieveFolder)
        this.lists = folderParsed;
        return folderParsed;
    }

    createFolder(name: string){
        const idFolder = this.lists.length + "";
        this.lists.push({ 
            id: idFolder, 
            name,
            verseToShow: 5,
            nextChapterOnSecond: 1,
            readTarget: 1,
            showFirstLetter: false,
            showTafseer: false,
            arabicSize: 30,
            isShowRandomVerse: false
        });
        this.saveToLocalStorage();
    }

    updateFolder(id: string, keyValue: FolderUpdate) {
        if(!this.lists.length) this.getFolder();
        const findIndex = this.lists.findIndex((folder) => folder.id === id);
        if(findIndex < 0) return;

        this.lists[findIndex] = { ...this.lists[findIndex], ...keyValue };
        this.saveToLocalStorage();
    }

    saveToLocalStorage () {
        if(typeof window === 'undefined') return;
        window.localStorage.setItem(this.#storageName, JSON.stringify(this.lists));
    }

    getFolderInfoById(id: string): FolderInterface|undefined {

        const folders = this.getFolder();
        if(!folders) return;

        const findIndex = folders.findIndex((folder) => folder.id === id)
        if(findIndex < 0) return;

        return folders[findIndex];
    }

    getListFolderExcept(idFolder: string): FolderInterface[]|undefined {
        const filters = this.lists.filter((fold) => fold.id !== idFolder);

        if(filters.length) return filters;
    }

    async sendLocalFolderToServer() {
        let isOkeToSend = confirm("Kirimkan data lokal ke database?")
        if(!isOkeToSend) return;
        if(!this.lists.length) return;

        const Chapter = new ChaptersOperation();
        const chapters = Chapter.retrieveChapter();

        for(let folder of this.lists) {
            
            if( folder.id.length > 3) continue;
            const dataToSend = { 
                name: folder.name,
                total_verse_to_show: folder.verseToShow,
                show_next_chapter_on_second: folder.nextChapterOnSecond,
                read_target: folder.readTarget,
                is_show_first_letter: folder.showFirstLetter,
                is_show_tafseer: folder.showTafseer,
                arabic_size: folder.arabicSize
            }
            
            const createFolder = await requestToServer("memverses/folder", "POST", JSON.stringify(dataToSend));
            let idFolder = "";
            if(isResponseFromFetch(createFolder)) {
                const responseJSON = await createFolder.json() as {
                    "success": true,
                    "id": "WAR22500001"
                  };
                if(createFolder.status === 201) idFolder = responseJSON.id;
    
                else {
                    alert(createFolder)
                    return;
                }
            }

            if(idFolder === "") return;

            this.updateFolder(folder.id, { id: idFolder });

            const getChapters = chapters?.filter((chapter) => chapter.idFolder === folder.id);
            if(!getChapters?.length) continue;

            for(let chapter of getChapters){
                const dataChapterToSend = {
                    "id_chapter_client": chapter.id,
                    "id_folder": idFolder,
                    "chapter": chapter.chapter,
                    "verse": chapter.verse,
                    "readed_times": chapter.readed
                  }
                await requestToServer("memverses/chapter", "POST", JSON.stringify(dataChapterToSend));
                Chapter.moveVerseToFolder(chapter.id, idFolder);
            }

        }
    }

}