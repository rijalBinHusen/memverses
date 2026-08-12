// detect the id of the folder
// retrieve folder on localstorage, show the name of folder
// retrieve all verses based on folder id
// sort all verses ascending

// setting should be content what language user set as quran translation

// reate static chpater all verses
// retrieve every chapter every show

import { Folder, type FolderInterface } from "../Folder"
import { type ILastPosition, LastPosition } from "./LastPosition"

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
    lastPosition = new LastPosition();
    lastPositionInfo: ILastPosition|undefined = undefined;

    constructor() {
        this.lastPositionInfo = this.lastPosition.getLastPosition();
        this.getLastPosition();
        // this.retrieveTitleFolder();
        // this.retrieveChapter();
    }

    getLastPosition(): string | undefined {

        if(this.lastPositionInfo) {

            this.#idFolder = this.lastPositionInfo.idFolder
            return this.#idFolder;
        }

    }

    getChapterAndVerse(): { chapter: number, verse: number } {
        if (typeof window === "undefined") return { chapter: 1, verse: 1 };

        const params = new URLSearchParams(window.location.search);
        const getChapter = params.get('id');
        const getVerse = params.get('verse');

        const chapter = getChapter ? Number(getChapter) : 1;
        const verse = getVerse ? Number(getVerse) : 1;


        return { chapter, verse }
    }

    updateVerseURLParams(verse: number) {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        params.set('verse', verse.toString());
        window.history.pushState({ verse }, '', `${window.location.pathname}?${params.toString()}`);
    }

    // retrieveTitleFolder(): string {

    //     const folderClass = new Folder();

    //     folderClass.getFolder();
    //     const folderInfo = folderClass.getFolderInfoById(this.#idFolder);
    //     if (!folderInfo) return "Folder tidak ditemukan";

    //     this.titleFolder = folderInfo.name;
    //     this.folderInfo = folderInfo
    //     return this.titleFolder;
    // }

    // retrieveChapter() {
    //     if (typeof window === 'undefined') return;
    //     const retrieveChapter = window.localStorage.getItem(this.#storageName);

    //     if (retrieveChapter === null) return

    //     if (typeof Blob != "undefined") {

    //         const sizeOfLocalStorage = new Blob(Object.values(localStorage)).size;
    //         const isOnLimit = sizeOfLocalStorage >= 4500000;
    //         if (isOnLimit) {
    //             alert("Website menyimpan terlalu banyak data!")
    //         }
    //     }

    //     const versesParsed: Chapter[] = JSON.parse(retrieveChapter)
    //     if (typeof versesParsed[0].id === 'undefined') {

    //         this.lists = versesParsed.map((vers) => ({
    //             ...vers, id: (vers.chapter * 300) + vers.verse
    //         }))
    //     } else {

    //         this.lists = versesParsed;
    //     }

    //     return this.lists;
    // }

    // sortChapterAndVerses() {

    //     // sort list based on verses desc and chapter asc
    //     if (this.folderInfo.orderChapterDesc === true) {

    //         this.lists = this.lists.sort((a, b) => {
    //             if (a.chapter !== b.chapter) return b.chapter - a.chapter;
    //             return a.verse - b.verse;
    //         })
    //     }
    //     else {

    //         this.lists = this.lists.sort((a, b) => {
    //             if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    //             return a.verse - b.verse;
    //         })
    //     }
    // }

    // saveToLocalStorage() {
    //     if (typeof window === 'undefined') return;
    //     window.localStorage.setItem(this.#storageName, JSON.stringify(this.lists));
    // }

    // addChapter(chapter: number, start: number, end: number) {

    //     for (let i = start; i <= end; i++) {

    //         const findIndex = this.lists.findIndex((vers) => vers.idFolder === this.#idFolder && vers.chapter === chapter && vers.verse === i);
    //         if (findIndex === -1) {

    //             this.lists.push({
    //                 idFolder: this.#idFolder,
    //                 id: (chapter * 300) + i,
    //                 chapter,
    //                 verse: i,
    //                 readed: 0
    //             })
    //         }
    //     }

    //     this.lists.sort((a, b) => a.id - b.id);
    //     this.saveToLocalStorage();
    // }

    async getChapterAndVerses(chapter:number): Promise<VerseToShow[] | undefined> {

        const fetchVerse = await fetch(`/verses/${chapter}.json`, { cache: "force-cache" });
        if (!fetchVerse) return;
        const verseRetrieved = await fetchVerse.json() as verseAndChapterDetail;

        const result = <VerseToShow[]>[]

        for (let i = 1; i <= Number(verseRetrieved[chapter].number_of_ayah); i++) {

            const chapterStr = chapter + ""
            const verseStr = i + "";

            result.push({
                chapter: chapter,
                id: (chapter * 300) + i,
                idFolder: this.#idFolder,
                verse: i,
                readed: 0,
                arabic: verseRetrieved[chapterStr].text[verseStr],
                translate: verseRetrieved[chapterStr].translations["id"].text[verseStr],
                tafsir: verseRetrieved[chapterStr].tafsir["id"]["kemenag"].text[verseStr],
                showFirstLetter: this.folderInfo.showFirstLetter
            })
        }

        // return the completed verses and chapter
        return result;
    }

    // readVerse(id: number) {
    //     const findIndex = this.lists.findIndex((vers) => vers.idFolder === this.#idFolder && vers.id === id);
    //     // not foound
    //     if (findIndex === -1) return;

    //     const record = { ...this.lists[findIndex] };
    //     this.lists[findIndex] = { ...record, readed: record.readed + 1 }
    //     this.saveToLocalStorage();
    // }

    // moveVerseToFolder(verseId: number, idFolder: string) {
    //     const findIndex = this.lists.findIndex((vers) => vers.id === verseId);

    //     if (findIndex < 0) return;

    //     const record = { ...this.lists[findIndex] };
    //     this.lists[findIndex] = { ...record, idFolder }
    //     this.saveToLocalStorage();
    // }

    // resetVerseReaded(idFolder: string) {

    //     for (let i = 0; i < this.lists.length; i++) {
    //         const record = this.lists[i];

    //         if (record.idFolder === idFolder) {
    //             this.lists[i].readed = 0
    //         }
    //     }
    //     this.saveToLocalStorage();
    // }

    // getFolderInfo(): FolderInterface {
    //     return this.folderInfo;
    // }

    // getFoldersList() {
    //     const folderClass = new Folder();

    //     folderClass.getFolder();

    //     return folderClass.getListFolderExcept(this.#idFolder);
    // }
}

