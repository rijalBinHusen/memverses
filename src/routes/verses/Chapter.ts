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

    constructor() {
        this.getIdFolder();
    }

    getIdFolder(): string|undefined {
        if(typeof window === "undefined") return;
        if(this.#idFolder !== "") return;

        const fullQueryParam = window.location.search;
        if(!fullQueryParam.length) return;

        const queryParamSplitted = fullQueryParam.split("=");
        if(queryParamSplitted.length !== 2) return;

        const folderId = queryParamSplitted[1];
        if(!folderId || !folderId.length) return;

        this.#idFolder = folderId;
        return folderId
    }

    async retrieveTitleFolder (): Promise<string> {

        if(this.folderInfo?.id) return this.folderInfo.name;
        const folderClass = new Folder();
        const folderInfo = await folderClass.getFolderInfoById(this.#idFolder);
        if(!folderInfo) return "Folder tidak ditemukan";

        this.titleFolder = folderInfo.name;
        this.folderInfo = folderInfo
        return this.titleFolder;
    }

    async addChapter(chapter: number, start: number, end: number) {

        for(let i = start; i <= end; i++) {
                
                const dataToSendToBackend = {
                    idFolder: this.#idFolder,
                    id: (chapter * 300) + i,
                    chapter,
                    verse: i,
                    readed: 0,
                    id_chapter: "",
                    id_chapter_client: (chapter * 300) + i,
                    id_folder: this.#idFolder
                }

                const postData = await requestToServer("memverses/chapter/", "POST", JSON.stringify(dataToSendToBackend));
                if(isResponseFromFetch(postData)) {
                    if(postData.status !== 201) {
                        const data = await postData.json();
                        alert(data)
                    }
                }
        }
    }

    async getVersesFromBackEnd(): Promise<VerseToShow[]|undefined> {
        await this.retrieveTitleFolder();
        const folderInfo = this.folderInfo;
        
        let verseToShow = <Chapter[]>[];
        const fetchToServer = await requestToServer("memverses/unread_verses/" + this.#idFolder, "GET", "");
        if(isResponseFromFetch(fetchToServer)) {
            if(fetchToServer.status === 200) {
                const data = await fetchToServer.json() as ChapterResponseServer;
                // remove exists verses on idfolder
                this.lists = this.lists.filter((verse) => verse.id_folder != this.#idFolder);
                // filter where readed times < target read
                const filterVerses = data.data.filter((chapt) => chapt.readed_times < folderInfo.read_target);
                // pick only total verse to show
                verseToShow = filterVerses.splice(0, folderInfo.total_verse_to_show);
                // put all to the state
                this.lists = this.lists.concat(data.data);
            }
        }

        const result = await this.convertVerseToMoreDetails(verseToShow);
        // return the completed verses and chapter
        return result;
    }

    async getUnReadedVerse(): Promise<VerseToShow[]|undefined> {
        
        await this.retrieveTitleFolder();
        const folderInfo = this.folderInfo;
        
        let verseToShow = <Chapter[]>[];
        const fetchToServer = await requestToServer("memverses/unread_verses/" + this.#idFolder, "GET", "");
        if(isResponseFromFetch(fetchToServer)) {
            if(fetchToServer.status === 200) {
                const data = await fetchToServer.json() as ChapterResponseServer;
                // remove exists verses on idfolder
                this.lists = this.lists.filter((verse) => verse.id_folder != this.#idFolder);
                for(let chapt of data.data) {
                    if(verseToShow.length >= folderInfo.total_verse_to_show) continue;
                    verseToShow.push({
                        chapter: chapt.chapter,
                        id_chapter_client: chapt.id_chapter_client,
                        id_folder: chapt.id_folder,
                        readed_times: chapt.readed_times,
                        verse: chapt.verse,
                        id: chapt.id
                    })
                }
            }
        }

        const result = await this.convertVerseToMoreDetails(verseToShow);
        // return the completed verses and chapter
        return result;
    }

    async convertVerseToMoreDetails(verses: Chapter[]): Promise<VerseToShow[]|undefined> {
        
        let verseRetrieved = <verseAndChapterDetail>{};
        let result = <VerseToShow[]>[];
        // retrieve detail verses
        for (let chapter of verses) {

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
                showFirstLetter: this.folderInfo.is_show_first_letter
            })
        }
        return result;
    }

    readVerse(id_chapter: string) {
        return requestToServer("memverses/read/chapter/" + id_chapter, "PUT", "");

    }

    moveVerseToFolder(verseId: number, idFolder: string) {
        return requestToServer("memverses/move_to_folder/chapter/" + verseId, "PUT", JSON.stringify({
            id_folder: idFolder
        }));
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

