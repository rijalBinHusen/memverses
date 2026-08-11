<script lang="ts">
  import { onMount } from 'svelte';
  import VerticalFeed from './VerticalFeed.svelte';
  import { ChaptersOperation, type VerseToShow } from "./Chapter";

  const chapterOperation = new ChaptersOperation();
  const chapterNumber = 1; // Ganti dengan nomor chapter yang diinginkan
  let verses: VerseToShow[] = [];

  onMount(() => {
    chapterOperation.getChapterAndVerses(chapterNumber).then((data) => {
      if (data) {
        verses = data;
      }
    });
})

</script>

<VerticalFeed items={verses} />