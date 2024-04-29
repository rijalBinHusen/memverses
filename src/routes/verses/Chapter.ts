// detect the id of the folder
// retrieve folder on localstorage, show the name of folder
// retrieve all verses based on folder id
// sort all verses ascending

// setting should be content what language user set as quran translation

// reate static chpater all verses
// retrieve every chapter every show

import { Folder, type FolderInterface } from "../index/Folder"
import { fetchData } from "../../scipts/fetch";

interface ArabicQuran {
    [verse: string]: string
}

interface Translate {
    [language: string]: {
        name: string
        text: {
            [verse: string]: string
        }
    }
}

interface Tafsir {
    [language: string]: {
        [organtization: string]: {
            name: string
            source: string
            text: {
                [chapter: string]: string
            }
        }
    }
}

export interface verseAndChapterDetail {
    [chapter: string]: {
        number: string
        name: string
        name_latin: string
        number_of_ayah: string
        text: ArabicQuran
        translations: Translate
        tafsir: Tafsir
    }
};

export interface Chapter {
    idFolder: string
    id: number
    chapter: number
    verse: number
    readed: number
}

export interface VerseToShow extends Chapter {
    arabic: string
    translate: string
    tafsir: string
    showFirstLetter: boolean
}

export interface ChapterFormInterface {
    chapter: number,
    startVerse: number
    endVerse: number
}

export class ChaptersOperation {
    #idFolder = "";
    titleFolder: string = "";
    #storageName = "memorize-quran-chapter";
    lists = <Chapter[]>[];
    folderInfo = <FolderInterface>{};

    constructor() {
        this.getIdFolder();
        this.retrieveTitleFolder();
        this.retrieveChapter();
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

        const folderClass = new Folder();

        folderClass.getFolder();
        const folderInfo = folderClass.getFolderInfoById(this.#idFolder);
        if(!folderInfo) return "Folder tidak ditemukan";

        this.titleFolder = folderInfo.name;
        this.folderInfo = folderInfo
        return this.titleFolder;
    }

    retrieveChapter() {
        if(typeof window === 'undefined') return;
        const retrieveChapter = window.localStorage.getItem(this.#storageName);

        if(retrieveChapter === null) return

        if(typeof Blob != "undefined") {

            const sizeOfLocalStorage = new Blob(Object.values(localStorage)).size;
            const isOnLimit = sizeOfLocalStorage >= 4500000;
            if(isOnLimit) {
                alert("Website menyimpan terlalu banyak data!")
            }
        }

        const versesParsed: Chapter[] = JSON.parse(retrieveChapter)
        if(typeof versesParsed[0].id === 'undefined') {

            this.lists = versesParsed.map((vers) => ({
                ...vers, id: (vers.chapter * 300) + vers.verse
            }))
        } else {

            this.lists = versesParsed;
        }
        return versesParsed;
    }

    saveToLocalStorage () {
        if(typeof window === 'undefined') return;
        window.localStorage.setItem(this.#storageName, JSON.stringify(this.lists));
    }

    addChapter(chapter: number, start: number, end: number) {

        for(let i = start; i <= end; i++) {

            const findIndex = this.lists.findIndex((vers) => vers.idFolder === this.#idFolder && vers.chapter === chapter && vers.verse === i);
            if(findIndex === -1) {
                
                this.lists.push({
                    idFolder: this.#idFolder,
                    id: (chapter * 300) + i,
                    chapter,
                    verse: i,
                    readed: 0
                })
            }
        }

        this.lists.sort((a, b) => a.id - b.id );
        this.saveToLocalStorage();
    }

    async getUnReadedVerse(): Promise<VerseToShow[]|undefined> {
        
        if(!this.lists.length) return;
        this.retrieveTitleFolder();
        
        const idFolder = this.folderInfo.id
        const verseLimiter = this.folderInfo.verseToShow;
        const isRandomVerses = this.folderInfo.isShowRandomVerse;
        const readTarget = this.folderInfo.readTarget;

        let arrRandomIndex = [0];

        if(isRandomVerses) {
            // random array contain number
            arrRandomIndex = Array.from({ length: verseLimiter }, () => Math.floor(Math.random() * (this.lists.length - 1 + 1)) + 1);

        }

        let verseToShow = <Chapter[]>[];
        let allVerseInFolder = <Chapter[]>[];

        for(let i = 0; i < this.lists.length; i++) {
            const verse = this.lists[i];

            if(verse.idFolder === idFolder) {
                allVerseInFolder.push(verse)

                if(verse.readed < readTarget) {

                    if(verseToShow.length < verseLimiter) {

                        if(isRandomVerses) {
                            const possibiltyTrue = Math.random() * 100 < 5;
                            if(possibiltyTrue) verseToShow.push(verse)
                        } else {

                            verseToShow.push(verse)
                        }
                    };
                } 
            }
        }

        const isAnyVerseToShow = verseToShow.length;
        if(!isAnyVerseToShow && allVerseInFolder.length) {
            
            this.resetVerseReaded(idFolder);
            verseToShow = allVerseInFolder.slice(0, verseLimiter);
        }

        if(!verseToShow.length) return;

        const result = <VerseToShow[]>[]
        let verseRetrieved = <verseAndChapterDetail>{};

        // retrieve detail verses
        for (let chapter of verseToShow) {

            const chapterStr = chapter.chapter + ""
            const verseStr = chapter.verse + "";

            const isVerseRetrieved = verseRetrieved && verseRetrieved[chapterStr] && verseRetrieved[chapterStr].number === chapterStr;
            if(!isVerseRetrieved) {
                const fetchVerse = await fetchData(`/verses/${chapter.chapter}.json`);
                if(!fetchVerse) return;
                verseRetrieved = await fetchVerse.json() as verseAndChapterDetail;
            }
            
            result.push({
                ...chapter,
                arabic: verseRetrieved[chapterStr].text[verseStr],
                translate: verseRetrieved[chapterStr].translations["id"].text[verseStr],
                tafsir: verseRetrieved[chapterStr].tafsir["id"]["kemenag"].text[verseStr],
                showFirstLetter: this.folderInfo.showFirstLetter
            })
        }

        // return the completed verses and chapter
        return result;
    }

    readVerse(id: number) {
        const findIndex = this.lists.findIndex((vers) => vers.idFolder === this.#idFolder && vers.id === id);
        // not foound
        if(findIndex === -1) return;

        const record = { ...this.lists[findIndex] };
        this.lists[findIndex] = { ...record, readed: record.readed+ 1 }
        this.saveToLocalStorage();
    }

    moveVerseToFolder(verseId: number, idFolder: string) {
        
        const idsFolder = <string[]>[];
        let index = -1;
        let currentIdFolder = this.folderInfo.id;
        
        for(let i = 0; i < this.lists.length; i++) {
            const vers = this.lists[i];

            if(vers.id === verseId) {
                idsFolder.push(vers.idFolder);
                if(vers.idFolder === currentIdFolder) index = i;
            }
        }

        if(!idsFolder.length) return;
        
        const record = { ...this.lists[index] };
        this.lists[index] = { ...record, idFolder };
        
        if(idsFolder.length > 1) this.lists.splice(index, 1);
        this.saveToLocalStorage();
    }

    resetVerseReaded(idFolder: string) {

        for(let i = 0; i < this.lists.length; i++) {
            const record = this.lists[i];

            if(record.idFolder === idFolder) {
                this.lists[i].readed = 0
            }
        }
        this.saveToLocalStorage();
    }

    getFolderInfo (): FolderInterface {
        return this.folderInfo;
    }

    getFoldersList(){
        const folderClass = new Folder();

        folderClass.getFolder();

        return folderClass.getListFolderExcept(this.#idFolder);
    }
}

