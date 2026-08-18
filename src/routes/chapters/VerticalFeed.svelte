<script lang="ts">
  import { onMount } from 'svelte';
  import { type VerseToShow } from "./Chapter";

  // Props yang diterima dari parent component
  export let items: VerseToShow[] = [];
  export let onSwitchVerse: (verse: number) => void;

  let containerEl: HTMLElement;
  let cards: HTMLElement[] = [];

  export let currentIndex = 0;
  let isScrolling = false;

  // Posisi slot untuk 3 card: [-1 (prev), 0 (current), 1 (next)]
  let cardPositions = [-1, 0, 1];

  function updateCardContent(card: HTMLElement, dataIndex: number) {
    if (!items || items.length === 0) return;
    
    card.dataset.index = dataIndex.toString();
    const data = items[dataIndex];

    const arabicTextEl = card.querySelector('.arabic-text');
    const idTextEl = card.querySelector('.id-text');
    const contentInfoEl = card.querySelector('#content-info');

    if (arabicTextEl && idTextEl && contentInfoEl && data) {
      arabicTextEl.textContent = data.arabic;
      idTextEl.textContent = data.translate;
      contentInfoEl.textContent = `${data.chapterName} - ${data.chapter}:${data.verse}`;
    }
  }

  function initPositions() {
    if (!items || items.length === 0) return;
    const totalItems = items.length;

    cards.forEach((card, i) => {
      const pos = cardPositions[i];
      const dataIdx = (currentIndex + pos + totalItems) % totalItems;
      updateCardContent(card, dataIdx);
      card.style.transform = `translateY(${pos * 100}%)`;
    });
  }

  function navigate(direction: 'next' | 'prev') {
    if (isScrolling || !items || items.length === 0) return;
    isScrolling = true;

    const totalItems = items.length;
    const dir = direction === 'next' ? 1 : -1;
    currentIndex = (currentIndex + dir + totalItems) % totalItems;

    // Geser semua card satu slot
    cardPositions = cardPositions.map((pos, i) => {
      const newPos = pos - dir;
      // Jika card berada di posisi 0 (current), changes the url parameter verse
      if (newPos === 0) onSwitchVerse(items[currentIndex].verse);

      if (cards[i]) {
        cards[i].style.transform = `translateY(${newPos * 100}%)`;
      }
      return newPos;
    });

    // Daur ulang card setelah transisi animasi selesai
    setTimeout(() => {
      cardPositions.forEach((pos, i) => {
        if (pos !== 2 && pos !== -2) return;

        const wrappedPos = pos === 2 ? -1 : 1;
        const dataIdx = (currentIndex + wrappedPos + totalItems) % totalItems;
        const card = cards[i];

        if (card) {
          updateCardContent(card, dataIdx);
          card.style.transition = 'none';
          card.style.transform = `translateY(${wrappedPos * 100}%)`;
          card.offsetHeight; // Force reflow agar transition:none tereksekusi

          cardPositions[i] = wrappedPos;

          requestAnimationFrame(() => {
            card.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
          });
        }
      });

      isScrolling = false;
    }, 300);
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

  onMount(() => {
    
    cards = Array.from(containerEl.querySelectorAll<HTMLElement>('.reel-card'));
    initPositions();

    // Menyimpan timestamp terakhir kali elemen tersebut di-scroll oleh user
    const lastScrollTimeMap = new WeakMap<HTMLElement, number>();

    // Durasi delay/cooldown dalam milidetik (misal: 800ms)
    const SWIPE_DELAY_MS = 800;

    function isInsideScrollableElement(target: HTMLElement, deltaY: number): HTMLElement | null {
      let current: HTMLElement | null = target;

      while (current && current !== document.body && current !== document.documentElement) {
        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY;
        const isScrollable = overflowY === 'auto' || overflowY === 'scroll';

        if (isScrollable && current.scrollHeight > current.clientHeight) {
          const isAtTop = current.scrollTop === 0;
          const isAtBottom = Math.abs(current.scrollHeight - current.clientHeight - current.scrollTop) <= 1;
          
          const now = Date.now();
          const lastScrollTime = lastScrollTimeMap.get(current) || 0;

          // 1. Jika pengguna MASIH berada di tengah-tengah konten (belum mentok)
          if ((deltaY < 0 && !isAtTop) || (deltaY > 0 && !isAtBottom)) {
            // Catat waktu aktivitas scroll pengguna pada elemen ini
            lastScrollTimeMap.set(current, now);
            return current; // Pertahankan fokus pada elemen internal
          }

          // 2. Jika pengguna SUDAH mentok (atas/bawah), cek apakah jeda waktu baca sudah terpenuhi
          if ((deltaY < 0 && isAtTop) || (deltaY > 0 && isAtBottom)) {
            // Jika waktu sejak scroll terakhir masih KURANG dari delay yang ditentukan,
            // tahan/blokir swipe global sementara waktu
            if (now - lastScrollTime < SWIPE_DELAY_MS) {
              return current; // Anggap masih di dalam elemen agar swipe global TIDAK berjalan
            }
          }
        }

        current = current.parentElement;
      }

      return null; // Bebas beralih ke swipe global jika jeda waktu sudah habis
    }

    // Mouse wheel event
    const handleWheel = (e: WheelEvent) => {
      // e.preventDefault();
      const scrollableElement = isInsideScrollableElement(e.target as HTMLElement, e.deltaY);
      if (Math.abs(e.deltaY) < 30 || scrollableElement) return;
      // if (Math.abs(e.deltaY) < 30) return;
      navigate(e.deltaY > 0 ? 'next' : 'prev');
    };

    // Touch events
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;

      const scrollableElement = isInsideScrollableElement(e.target as HTMLElement, diffY);

      if (!scrollableElement && Math.abs(diffY) > 50) {
        navigate(diffY > 0 ? 'next' : 'prev');
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') navigate('next');
      if (e.key === 'ArrowUp') navigate('prev');
    };

    containerEl.addEventListener('wheel', handleWheel, { passive: false });
    containerEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    containerEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    // Add class when mounting /chapters
    document.body.classList.add('no-scroll');

    return () => {
      containerEl.removeEventListener('wheel', handleWheel);
      containerEl.removeEventListener('touchstart', handleTouchStart);
      containerEl.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      // Cleanup: Remove class when navigating to / or another page
      document.body.classList.remove('no-scroll');
    };

    
  });

  // Re-initialize jika data items berubah dinamis dari parent
  $: if (items && cards.length > 0) {
    initPositions();
  }
</script>

<div class="feed-container" bind:this={containerEl}>
  <div class="reel-card" data-index="0">
    <div class="content">
      <div class="content1"><p class="arabic-text">Loading...</p></div>
      <div class="content2"><p class="id-text"></p></div>
    </div>
    <div class="btn-content">
    <a href="/">
      <button>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="home-icon">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </button>
    </a>
      <div id="content-info"></div>
      <button on:click={copyCurrentUrl}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
      </button>
    </div>
  </div>
  <div class="reel-card" data-index="1">
    <div class="content">
      <div class="content1"><p class="arabic-text">Loading...</p></div>
      <div class="content2"><p class="id-text"></p></div>
    </div>
    <div class="btn-content">
      <a href="/">
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="home-icon">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </button>
      </a>
      <div id="content-info"></div>
      <button on:click={copyCurrentUrl}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
      </button>
    </div>
  </div>
  <div class="reel-card" data-index="2">
    <div class="content">
      <div class="content1"><p class="arabic-text">Loading...</p></div>
      <div class="content2"><p class="id-text"></p></div>
    </div>
    <div class="btn-content">
      <a href="/">
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="home-icon">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </button>
      </a>
      <div id="content-info"></div>
      <button on:click={copyCurrentUrl}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  @import "../../scss/variables";

  :global(body.no-scroll) {
    scrollbar-width: none;
    -ms-overflow-style: none;
    overflow: hidden;
    background-color: var(--bg-body, #ffffff);
    color: var(--text-main, #000000);
  }

  :global(body.no-scroll::-webkit-scrollbar) {
    display: none;
  }

  .feed-container {
    position: relative;
    max-width: $width-max;
    height: 100svh;
    overflow: hidden;
    background-color: var(--bg-feed);
    color: var(--text-feed);
    font-family: system-ui, -apple-system, sans-serif;
  }

  .reel-card {
    position: absolute;
    max-width: $width-max;
    margin: 0 auto;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0.6rem;
    box-sizing: border-box;
    will-change: transform;
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .content {
    display: flex;
    flex-direction: column;
    max-height: 90%;
  }

  .arabic-text {
    margin-bottom: 1rem;
    direction: rtl;

    @font-face {
        font-family: "Noto Naskh Arabic";
        src: url("/src/lib/NotoNaskhArabic-Medium.ttf") format("truetype");
    };

    font-family: 'Noto Naskh Arabic';
    font-size: 2.3rem;
  }

  .id-text {
    font-size: 1rem;
    color: var(--text-desc);
  }

  .content1,
  .content2 {
    flex: 1; /* Makes each content block take up 50% width */
    width: 100%; /* Ensures they don't grow past half the card */
    max-height: 50%; /* Spans the full height of the reel-card */
    overflow-y: auto; /* Enables scrolling if content overflows */
    
    /* Creates the transparent fade effect at the bottom */
    -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
    
    /* Hides standard scrollbars for a cleaner visual look (optional) */
    scrollbar-width: none; /* Firefox */
    padding-top:1rem;
  }

  .content1::-webkit-scrollbar,
  .content2::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }

  .btn-content {
    /* Fix position to the bottom of the screen */
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;

    /* Align content-info on the left and button on the right */
    display: flex;
    justify-content: space-between;
    align-items: center;

    /* Spacing and Styling */
    padding: 2px 16px;
  }

  /* Style for the button */
  .btn-content button {
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

  .btn-content button:hover {
    background-color: #0056b3;
  }
</style>