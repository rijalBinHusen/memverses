<script lang="ts">
  import { onMount } from 'svelte';
  import VerticalFeed from './VerticalFeed.svelte';
  import { ChaptersOperation, type VerseToShow } from "./Chapter";

  const chapterOperation = new ChaptersOperation();
  let verses: VerseToShow[] = [];
  let currentVerse: number = 1;
  let chapterName: string = '';

  onMount(() => {
    const chapterNumber = chapterOperation.getChapterAndVerse();
    chapterOperation.getChapterAndVerses(chapterNumber?.chapter).then((data) => {
      if (data) {
        verses = data;
      }
      chapterName = chapterOperation.chapterName;
    });

    currentVerse = chapterNumber?.verse || 1;
  })

  function switchVerse(verse: number) {
    chapterOperation.updateVerseURLParams(verse);
    currentVerse = verse;
  }

</script>

<VerticalFeed items={verses} onSwitchVerse={switchVerse} currentIndex={currentVerse - 1} chapterName={chapterName} />