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

    sendLocalFolderToServer() {
        
    }

}