export interface FolderInterface {
    id: string
    name: string
    chapterToShow: number
    nextChapterOnSecond: number
    readTarget: number
    showFirstLetter: boolean
    showTafseer: boolean
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
            chapterToShow: 5,
            nextChapterOnSecond: 3,
            readTarget: 3,
            showFirstLetter: false,
            showTafseer: false
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
}