export interface FolderInterface {
    id: string
    name: string
}

export class Folder {

    #storageName = "memorize-quran";
    lists = <FolderInterface[]>[];

    getFolder(): FolderInterface[]|void {
        const retrieveFolder = window.localStorage.getItem(this.#storageName);

        if(retrieveFolder === null) return

        const folderParsed: FolderInterface[] = JSON.parse(retrieveFolder)
        this.lists = folderParsed;
        return folderParsed;
    }

    createFolder(name: string){
        const idFolder = this.lists.length + "";
        this.lists.push({ id: idFolder, name });
        this.saveToLocalStorage();
    }

    updateFolder(id: string, name: string) {
        const findIndex = this.lists.findIndex((folder) => folder.id === id);
        if(findIndex < 0) return;

        this.lists[findIndex] = { id, name };
        this.saveToLocalStorage();
    }

    saveToLocalStorage () {
        window.localStorage.setItem(this.#storageName, JSON.stringify(this.lists));
    }
}