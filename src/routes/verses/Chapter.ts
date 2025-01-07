// detect the id of the folder
// retrieve folder on localstorage, show the name of folder
// retrieve all verses based on folder id
// sort all verses ascending

// setting should be content what language user set as quran translation

// reate static chpater all verses
// retrieve every chapter every show

import { Folder, type FolderInterface } from "../index/Folder"
import { fetchData, isResponseFromFetch, requestToServer } from "../../scipts/fetch";

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

interface ChapterResponseServer {
    success: boolean,
    data: Chapter[]
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
    id: string,
    id_chapter_client: string,
    id_folder: string,
    chapter: number,
    verse: number,
    readed_times: number
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
    lists = <Chapter[]>[];
    folderInfo = <FolderInterface>{};
    readed_verses = 0;
    #storageName = "memverses_folder"

    constructor() {
        this.getIdFolder();
    }

    getIdFolder(): string | undefined {
        if (typeof window === "undefined") return;
        if (this.#idFolder !== "") return;

        const fullQueryParam = window.location.search;
        if (!fullQueryParam.length) return;

        const queryParamSplitted = fullQueryParam.split("=");
        if (queryParamSplitted.length !== 2) return;

        const folderId = queryParamSplitted[1];
        if (!folderId || !folderId.length) return;

        this.#idFolder = folderId;
        return folderId
    }

    async retrieveTitleFolder(): Promise<string> {

        // is need to get folder from backend?
        let folderInfo = this.folderInfo
        if(folderInfo?.id && folderInfo.name && this.readed_verses < 10) return this.titleFolder;
        
        else {
            this.readed_verses = 0;
            const folderClass = new Folder();
            const getFolderInfo = await folderClass.getFolderInfoById(this.#idFolder);
            if (!getFolderInfo) return "Folder tidak ditemukan";
            this.titleFolder = getFolderInfo.name;
            this.folderInfo = getFolderInfo
            return this.titleFolder;
        } 

    }

    retrieveChapter() {
        if (typeof window === 'undefined') return;
        const retrieveChapter = window.localStorage.getItem(this.#storageName);

        if (retrieveChapter === null) return

        if (typeof Blob != "undefined") {

            const sizeOfLocalStorage = new Blob(Object.values(localStorage)).size;
            const isOnLimit = sizeOfLocalStorage >= 4500000;
            if (isOnLimit) {
                alert("Website menyimpan terlalu banyak data!")
            }
        }

        const versesParsed: Chapter[] = JSON.parse(retrieveChapter)
        // if (typeof versesParsed[0].id === 'undefined') {

        //     this.lists = versesParsed.map((vers) => ({
        //         ...vers, id: (vers.chapter * 300) + vers.verse
        //     }))
        // } else {

        this.lists = versesParsed;
        // }
        return versesParsed;
    }

    saveToLocalStorage() {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(this.#storageName, JSON.stringify(this.lists));
    }

    async addChapter(chapter: number, start: number, end: number) {

        for (let i = start; i <= end; i++) {

            const findIndex = this.lists.findIndex((vers) => vers.id_folder === this.#idFolder && vers.chapter === chapter && vers.verse === i);
            if (findIndex === -1) {
                // post data to backend
                const dataToSend: Chapter = {
                    chapter,
                    id: "",
                    id_chapter_client: (chapter * 300) + i + '',
                    id_folder: this.#idFolder,
                    readed_times: 0,
                    verse: i
                }
                const postData = await requestToServer("memverses/chapter/", "POST", JSON.stringify(dataToSend));
                if (isResponseFromFetch(postData)) continue;

            }
        }
    }

    async getUnReadedVerse(): Promise<VerseToShow[] | undefined> {

        await this.retrieveTitleFolder();

        const idFolder = this.folderInfo.id
        const verseLimiter = this.folderInfo.total_verse_to_show;
        const readTarget = this.folderInfo.read_target;
        const isNeedToFetchBackEnd = this.folderInfo.is_changed_by_other_devices;

        if (isNeedToFetchBackEnd || !this.lists.length) {
            await this.getVersesFromBackEnd();
        }
        // let arrRandomIndex = [0];

        // if(isRandomVerses) {
        //     // random array contain number
        //     arrRandomIndex = Array.from({ length: verseLimiter }, () => Math.floor(Math.random() * (this.lists.length - 1 + 1)) + 1);

        // }

        let verseToShow = <Chapter[]>[];
        let allVerseInFolder = <Chapter[]>[];

        for (let i = 0; i < this.lists.length; i++) {
            const verse = this.lists[i];
            if (verse.id_folder === idFolder) {
                allVerseInFolder.push(verse)

                if (verse.readed_times < readTarget) {
                    if (verseToShow.length < verseLimiter) {
                        // if (isRandomVerses) {
                        //     const possibiltyTrue = Math.random() * 100 < 5;
                        //     if (possibiltyTrue) verseToShow.push(verse)
                        // } else {

                        verseToShow.push(verse)
                        // }
                    };
                }
            }
        }

        const isAnyVerseToShow = verseToShow.length;
        if (!isAnyVerseToShow && allVerseInFolder.length) {

            this.resetVerseReaded(idFolder);
            verseToShow = allVerseInFolder.slice(0, verseLimiter);
        }

        if (!verseToShow.length) return;

        let verseRetrieved = <verseAndChapterDetail>{};
        let result = <VerseToShow[]>[];
        // retrieve detail verses
        for (let chapter of verseToShow) {

            const chapterStr = chapter.chapter + ""
            const verseStr = chapter.verse + "";

            const isVerseRetrieved = verseRetrieved && verseRetrieved[chapterStr] && verseRetrieved[chapterStr].number === chapterStr;
            if (!isVerseRetrieved) {
                const fetchVerse = await fetchData(`/verses/${chapter.chapter}.json`);
                if (!fetchVerse) return;
                verseRetrieved = await fetchVerse.json() as verseAndChapterDetail;
            }

            result.push({
                ...chapter,
                arabic: verseRetrieved[chapterStr].text[verseStr],
                translate: verseRetrieved[chapterStr].translations["id"].text[verseStr],
                tafsir: verseRetrieved[chapterStr].tafsir["id"]["kemenag"].text[verseStr],
                showFirstLetter: this.folderInfo.is_show_first_letter
            })
        }
        // return the completed verses and chapter
        return result;
    }

    readVerse(id: string) {
        const findIndex = this.lists.findIndex((vers) => vers.id_folder === this.#idFolder && vers.id === id);
        // not foound
        if (findIndex === -1) return;

        const record = { ...this.lists[findIndex] };
        this.lists[findIndex] = { ...record, readed_times: record.readed_times + 1 }
        this.readed_verses++;
        this.saveToLocalStorage();
        requestToServer("memverses/read/chapter/" + id, "PUT", "");
    }

    moveVerseToFolder(verseId: string, idFolder: string) {

        // move verse to another folder
        // prohibited to move to folder where the verse.id exists
        const idsFolder = <string[]>[];
        let index = -1;
        let currentIdFolder = this.folderInfo.id;

        for (let i = 0; i < this.lists.length; i++) {
            const vers = this.lists[i];

            if (vers.id === verseId) {
                idsFolder.push(vers.id_folder);
                if (vers.id_folder === currentIdFolder) index = i;
            }
        }

        if (!idsFolder.length) return;

        const record = { ...this.lists[index] };
        this.lists[index] = { ...record, id_folder: idFolder };

        // remove verse from current folder
        if (idsFolder.length > 1) this.lists.splice(index, 1);
        this.saveToLocalStorage();
        const dataToSend = { id_folder: idFolder };
        requestToServer("memverses/move_to_folder/chapter/" + verseId, "PUT", JSON.stringify(dataToSend));
    }

    resetVerseReaded(idFolder: string) {

        for (let i = 0; i < this.lists.length; i++) {
            const record = this.lists[i];

            if (record.id_folder === idFolder) {
                this.lists[i].readed_times = 0
            }
        }
        this.saveToLocalStorage();
        requestToServer("memverses/reset_readed_times/folder/" + idFolder, "PUT", "");
    }

    getFolderInfo(): FolderInterface {
        return this.folderInfo;
    }

    getFoldersList() {
        const folderClass = new Folder();

        folderClass.getFolder();

        return folderClass.getListFolderExcept(this.#idFolder);
    }

    async getVersesFromBackEnd() {
        if (this.#idFolder.length < 4) return;

        this.lists = [];
        const getChapter = await requestToServer("memverses/chapters/" + this.#idFolder, "GET", "");

        if (isResponseFromFetch(getChapter)) {
            const responseJSON = await getChapter.json() as ChapterResponseServer;
            if (getChapter.status === 200) {
                this.lists = this.lists.filter((chapt) => chapt.id_folder != this.#idFolder);
                this.lists = this.lists.concat(responseJSON.data);
                this.saveToLocalStorage();
            }

            else if(getChapter.status < 500) {
                // do nothing
            }

            else {
                alert(getChapter)
                return;
            }
        }
    }

}

