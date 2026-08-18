<script lang="ts">
  import { onMount } from 'svelte';
  import VerticalFeed from './VerticalFeed.svelte';
  import { ChaptersOperation, type VerseToShow } from "./Chapter";
	import Seo from "../../components/seo.svelte";
	import welcome_fallback from "$lib/images/svelte-welcome.png";

  const chapterOperation = new ChaptersOperation();
  let verses: VerseToShow[] = [];
  let currentVerse: number = 1;

  // There is no verses


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

<Seo
	title="Scroll Al-quran"
	description="Enjoy this kind of doom scrolling"
	link="localhost:3000"
	thumbnail={welcome_fallback}
/>

<section>
  {#if verses.length}
    <VerticalFeed 
      items={verses} 
      onSwitchVerse={switchVerse} 
      currentIndex={currentVerse - 1}
    />
  {:else}
      <div>Tidak ayat untuk dibaca, tekan tombol + dibawah :)</div>
  {/if}
</section>