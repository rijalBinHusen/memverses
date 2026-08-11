interface ILastPosition {
    idFolder: string
    chapter: number
    verse: number
}

class LastPosition {
    #storageName = "memorize-quran-last-position";
    lastPosition: ILastPosition = {
        idFolder: "",
        chapter: 1,
        verse: 1
    }

    getLastPosition(): ILastPosition | undefined {
        if (typeof window === 'undefined') return;
        const retrieveLastPosition = window.localStorage.getItem(this.#storageName);

        if (retrieveLastPosition === null) return

        const lastPositionParsed: ILastPosition = JSON.parse(retrieveLastPosition)
        this.lastPosition = lastPositionParsed;
        return lastPositionParsed;
    }

    updateLastPosition(idFolder: string, chapter: number, verse: number) {
        this.lastPosition = { idFolder, chapter, verse };
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(this.#storageName, JSON.stringify(this.lastPosition));
    }
}

export { LastPosition, type ILastPosition }