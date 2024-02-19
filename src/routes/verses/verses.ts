// detect the id of the folder
// retrieve folder on localstorage, show the name of folder
// retrieve all verses based on folder id
// sort all verses ascending

// setting should be content what language user set as quran translation

// reate static chpater all verses
// retrieve every chapter every show

import { Folder, type FolderInterface } from "../Folder"

interface ArabicQuran {
    [chapter: string]: string
}

interface Translate {
    [language: string]: {
        name: string
        text: {
            [chapter: string]: string
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
    [verse: string]: {
        number: string
        name: string
        name_latin: string
        number_of_ayah: string
        text: ArabicQuran
        translations: Translate
        tafsir: Tafsir
    }
};

export interface Verse {
    idFolder: string
    verse: number
    chapter: number
    readed: number
}

export interface ChapterToShow extends Verse {
    arabic: string
    translate: string
    tafsir: string
    showFirstLetter: boolean
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
    folderInfo = <FolderInterface>{};

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

        const folderClass = new Folder();

        folderClass.getFolder();
        const folderInfo = folderClass.getFolderInfoById(this.#idFolder);
        if(!folderInfo) return "Folder tidak ditemukan";

        this.titleFolder = folderInfo.name;
        this.folderInfo = folderInfo
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

    async getUnReadedChapter(): Promise<ChapterToShow[]|undefined> {
        if(!this.lists.length) return;
        this.retrieveTitleFolder();
        
        const idFolder = this.folderInfo.id
        const chapterLimiter = this.folderInfo.chapterToShow;

        let chapterToShow = <Verse[]>[]
        
        const filterList = this.lists.filter((vers) => vers.idFolder == idFolder);

        if(filterList.length) {
            const filterUnreaded = filterList.filter((vers) => vers.readed < this.folderInfo.readTarget)

            if(filterUnreaded.length) {

                chapterToShow = filterUnreaded.slice(0, chapterLimiter);
            }

            else {
    
                // reset readed
                this.lists = this.lists.map((vers) => ({
                    ...vers, readed: 0
                }))
                this.saveToLocalStorage();
                chapterToShow = this.lists.slice(0, chapterLimiter)
            }
        } else return;


        const result = <ChapterToShow[]>[]
        let verseRetrieved = <verseAndChapterDetail>{};

        for (let chapter of chapterToShow) {

            const verseStr = chapter.verse + "";
            const chapterStr = chapter.chapter + ""

            const isVerseRetrieved = verseRetrieved && verseRetrieved[verseStr] && verseRetrieved[verseStr].number === (verseStr)
            if(!isVerseRetrieved) {
                const fetchVerse = await fetch(`/verses/${chapter.verse}.json`, { cache: "force-cache"});
                if(!fetchVerse) return;
                verseRetrieved = await fetchVerse.json() as verseAndChapterDetail;
            }
            
            result.push({
                ...chapter,
                arabic: verseRetrieved[verseStr].text[chapterStr],
                translate: verseRetrieved[verseStr].translations["id"].text[chapterStr],
                tafsir: verseRetrieved[verseStr].tafsir["id"]["kemenag"].text[chapterStr],
                showFirstLetter: this.folderInfo.showFirstLetter
            })
        }

        // return the completed verses and chapter
        return result;
    }

    readChapter(verse: number, chapter: number) {
        const findIndex = this.lists.findIndex((vers) => vers.idFolder === this.#idFolder && vers.verse === verse && vers.chapter === chapter);
        // not foound
        if(findIndex === -1) return;

        const record = { ...this.lists[findIndex] };
        this.lists[findIndex] = { ...record, readed: record.readed+ 1 }
        this.saveToLocalStorage();
    }

    getFolderInfo (): FolderInterface {
        return this.folderInfo;
    }
}

