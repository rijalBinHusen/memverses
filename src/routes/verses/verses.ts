// detect the id of the folder
// retrieve folder on localstorage, show the name of folder
// retrieve all verses based on folder id
// sort all verses ascending

// setting should be content what language user set as quran translation

// reate static chpater all verses
// retrieve every chapter every show

import { Folder } from "../Folder"

export interface Verse {
    idFolder: string
    verse: number
    chapter: number
    readed: number
}

export interface VersesFormInterface {
    verse: number,
    startChapter: number
    endChapter: number
}

export class VersesOperation {
    #idFolder = "";
    titleFolder: string = "";
    #storageName = "memorize-quran-verses";
    lists = <Verse[]>[];

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

        const versesParsed: Verse[] = JSON.parse(retrieveVerses)
        this.lists = versesParsed;
        return versesParsed;
    }

    saveToLocalStorage () {
        if(typeof window === 'undefined') return;
        window.localStorage.setItem(this.#storageName, JSON.stringify(this.lists));
    }

    addVerses(verse: number, chapter: number) {
        const findIndex = this.lists.findIndex((vers) => vers.idFolder === this.#idFolder && vers.verse === verse && vers.chapter === chapter);
        if(findIndex > -1) return;
        
        this.lists.push({
            idFolder: this.#idFolder,
            verse,
            chapter,
            readed: 0
        })

        this.saveToLocalStorage();
    }

    getUnReadedVchapter(limiter: number): Verse[]|undefined {
        if(!this.lists.length) return;
        
        const filterList = this.lists.filter((vers) => vers.idFolder === this.#idFolder && vers.readed === 0);

        if(filterList.length) return filterList.slice(0, limiter);

        // reset readed
        this.lists = this.lists.map((vers) => ({
            ...vers, readed: 0
        }))

        this.saveToLocalStorage();
        return this.lists.slice(0, limiter)
    }
}

