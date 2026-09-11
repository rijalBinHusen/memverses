<script lang="ts">
  import { onMount } from 'svelte';
  import VerticalFeed from './VerticalFeed.svelte';
  import { ChaptersOperation, type VerseToShow } from "./Chapter";
  import Modal from '../../components/Modal.svelte';
  import SettingForm from './SettingForm.svelte';
  import Seo from '../../components/seo.svelte';

  const chapterOperation = new ChaptersOperation();
  let verses: VerseToShow[] = [];
  let currentVerse: number = 1;

  let titlePage = "Halaman utama";
  let descriptionPage = "Doom scrolling quran"

  onMount(() => {
    const chapterNumber = chapterOperation.getChapterAndVerseOnQueryParameter();
    chapterOperation.getChapterAndVerses(chapterNumber?.chapter).then((data) => {
      if (data) {
        verses = data;
        titlePage = "Surah " + data[chapterNumber.verse].chapterName + " ayat " + chapterNumber.verse
      }
    });

    currentVerse = chapterNumber?.verse || 1;

    if(typeof window === "undefined") return;
    const getArabicSize = window.localStorage.getItem("memverses-arabic-size")
    arabicSize = Number(getArabicSize) || 40;
  })

  function switchVerse(chapter: number, verse: number) {
    chapterOperation.updateVerseURLParams(verse);
    currentVerse = verse;
  }

  async function copyCurrentUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('URL copied to clipboard!');
      return true;
    } catch (err) {
      console.error('Failed to copy URL: ', err);
      return false;
    }
  }

  
	let showModal = false;
	let arabicSize = 40;

	async function toggleModal() {
		showModal = !showModal;
	}

  function updateArabicSize(e: any) {
    const newArabicSize = e.detail as number;
    arabicSize = newArabicSize;

    if(typeof window === "undefined") return;
    window.localStorage.setItem("memverses-arabic-size", newArabicSize + "")
    toggleModal();
  }

</script>

<Seo
	title={titlePage}
	description={descriptionPage}
>
</Seo>

<section>

	<div class="setting-btn">
		<h1>{ verses.length ? 'Memverses' : 'Loading' }</h1>
		<span>
			<button on:click={() => toggleModal()}>&#9881;</button>
		</span>
	</div>
  {#if verses.length}
    <VerticalFeed 
      items={verses} 
      onSwitchVerse={switchVerse} 
      currentIndex={currentVerse - 1}
      onGetNewVerses={() => {}}
      onSwipeVerse={() => {}}
      arabicSize={arabicSize}
    >
      <button slot="right-btn" class="btn-content" on:click={copyCurrentUrl}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
      </button>
    </VerticalFeed>
  {/if}
  <Modal
		on:closeModal={() => toggleModal()}
		isOpen={showModal}
		title="Setting"
	>
		<SettingForm
				arabicSize={arabicSize}
				on:updateSetting={updateArabicSize}
			/>
	</Modal>
</section>

<style lang="scss">
  @import "../../scss/variables";

  .setting-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: fixed;
      top: 0;
      z-index: 100;
      max-width: $width-max;
      width: calc(100svw - 1rem);
  }

  .setting-btn button {
      background-color: $secondary-color;
      // padding: .2rem .4rem .2rem .4rem;
      border: 1px solid $primary-color;
      color: $primary-color;
      font-weight: bolder;
      cursor: pointer;
      font-size: x-large;
      border-radius: 50%;
  }

  /* Style for the button */
  .btn-content {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    font-size: 20px;
    font-weight: bold;
    border: none;
    border-radius: 50%;
    background-color: #007bff;
    color: var(--text-feed);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-content:hover {
    background-color: #0056b3;
  }
</style>