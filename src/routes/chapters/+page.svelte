<script lang="ts">
  import { onMount } from 'svelte';
  import VerticalFeed from './VerticalFeed.svelte';
  import { ChaptersOperation, type VerseToShow } from "./Chapter";

  const chapterOperation = new ChaptersOperation();
  let verses: VerseToShow[] = [];
  let currentVerse: number = 1;

  onMount(() => {
    const chapterNumber = chapterOperation.getChapterAndVerseOnQueryParameter();
    chapterOperation.getChapterAndVerses(chapterNumber?.chapter).then((data) => {
      if (data) {
        verses = data;
      }
    });

    currentVerse = chapterNumber?.verse || 1;
  })

  function switchVerse(verse: number) {
    chapterOperation.updateVerseURLParams(verse);
    currentVerse = verse;
  }

</script>

<VerticalFeed items={verses} onSwitchVerse={switchVerse} currentIndex={currentVerse - 1} />