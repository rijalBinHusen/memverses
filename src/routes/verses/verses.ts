// detect the id of the folder
// retrieve folder on localstorage, show the name of folder
// retrieve all verses based on folder id
// sort all verses ascending

// setting should be content what language user set as quran translation

import { Folder } from "../Folder"

interface Verses {
    verses: number
    chapter: number
    content: string
    translation: string
    readed: number //today
}

export class VersesOperation {
    #idFolder = "";
    titleFolder: string = "";
    #storageName = "memorize-quran-verses";
    lists = <Verses[]>[];

    constructor() {
        this.getIdFolder();
        this.retrieveTitleFolder();
        this.retrieveVerses();
    }

    getIdFolder(): string|undefined {
        if(typeof window === "undefined") return;

        const fullQueryParam = window.location.search;
        if(!fullQueryParam.length) return;

        const queryParamSplitted = fullQueryParam.split("=");
        if(queryParamSplitted.length !== 2) return;

        const folderId = queryParamSplitted[1];
        if(!folderId || !folderId.length) return;

        this.#idFolder = folderId;
        return folderId
    }

    retrieveTitleFolder (): string {
        if(this.titleFolder) return this.titleFolder;

        const folderClass = new Folder();

        folderClass.getFolder();
        const folderInfo = folderClass.getFolderInfoById(this.#idFolder);
        if(!folderInfo) return "Folder tidak ditemukan";

        this.titleFolder = folderInfo.name;
        return this.titleFolder;
    }

    retrieveVerses() {
        if(typeof window === 'undefined') return;
        const retrieveVerses = window.localStorage.getItem(this.#storageName);

        if(retrieveVerses === null) return

        const versesParsed: Verses[] = JSON.parse(retrieveVerses)
        this.lists = versesParsed;
        return versesParsed;
    }

    saveToLocalStorage () {
        if(typeof window === 'undefined') return;
        window.localStorage.setItem(this.#storageName, JSON.stringify(this.lists));
    }
}

