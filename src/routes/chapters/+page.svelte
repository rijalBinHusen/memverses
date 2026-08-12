<script lang="ts">
  import { onMount } from 'svelte';
  import VerticalFeed from './VerticalFeed.svelte';
  import { ChaptersOperation, type VerseToShow } from "./Chapter";

  const chapterOperation = new ChaptersOperation();
  let verses: VerseToShow[] = [];

  onMount(() => {
    const chapterNumber = chapterOperation.getChapterAndVerse();
    chapterOperation.getChapterAndVerses(chapterNumber?.chapter).then((data) => {
      if (data) {
        verses = data;
      }
    });
  })

  function switchVerse(verse: number) {
    chapterOperation.updateVerseURLParams(verse);
  }

</script>

<VerticalFeed items={verses} onSwitchVerse={switchVerse} />