<script lang="ts">
  import { onMount } from 'svelte';
  import { type VerseToShow } from "./Chapter";

  // Props yang diterima dari parent component
  export let items: VerseToShow[] = [];

  let containerEl: HTMLElement;
  let cards: HTMLElement[] = [];

  let currentIndex = 0;
  let isScrolling = false;

  // Posisi slot untuk 3 card: [-1 (prev), 0 (current), 1 (next)]
  let cardPositions = [-1, 0, 1];

  function updateCardContent(card: HTMLElement, dataIndex: number) {
    if (!items || items.length === 0) return;
    
    card.dataset.index = dataIndex.toString();
    const data = items[dataIndex];

    const titleEl = card.querySelector('.title');
    const descEl = card.querySelector('.desc');

    if (titleEl && descEl && data) {
      titleEl.textContent = data.arabic;
      descEl.textContent = data.translate;
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

  onMount(() => {
    cards = Array.from(containerEl.querySelectorAll<HTMLElement>('.reel-card'));
    initPositions();

    // Mouse wheel event
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 30) return;
      navigate(e.deltaY > 0 ? 'next' : 'prev');
    };

    // Touch events
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;
      if (Math.abs(diffY) > 50) {
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
    containerEl.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      containerEl.removeEventListener('wheel', handleWheel);
      containerEl.removeEventListener('touchstart', handleTouchStart);
      containerEl.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  // Re-initialize jika data items berubah dinamis dari parent
  $: if (items && cards.length > 0) {
    initPositions();
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
</svelte:head>

<div class="feed-container" bind:this={containerEl}>
  <div class="reel-card" data-index="0">
    <div class="content">
      <h1 class="title">Loading...</h1>
      <p class="desc"></p>
    </div>
  </div>
  <div class="reel-card" data-index="1">
    <div class="content">
      <h1 class="title">Loading...</h1>
      <p class="desc"></p>
    </div>
  </div>
  <div class="reel-card" data-index="2">
    <div class="content">
      <h1 class="title">Loading...</h1>
      <p class="desc"></p>
    </div>
  </div>
</div>

<style>
  :global(body) {
    scrollbar-width: none;
    -ms-overflow-style: none;
    overflow: hidden;
    background-color: var(--bg-body, #ffffff);
    color: var(--text-main, #000000);
  }

  :global(body::-webkit-scrollbar) {
    display: none;
  }

  :root {
    --bg-body: #ffffff;
    --text-main: #000000;
    --bg-feed: #ffffff;
    --text-feed: #000000;
    --bg-card: aliceblue;
    --text-desc: #555555;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg-body: #000000;
      --text-main: #ffffff;
      --bg-feed: #000000;
      --text-feed: #ffffff;
      --bg-card: #121212;
      --text-desc: #aaaaaa;
    }
  }

  .feed-container {
    position: relative;
    height: 100vh;
    overflow: hidden;
    background-color: var(--bg-feed);
    color: var(--text-feed);
    font-family: system-ui, -apple-system, sans-serif;
  }

  .reel-card {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    box-sizing: border-box;
    will-change: transform;
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    background-color: var(--bg-card);
  }

  .content {
    max-width: 600px;
  }

  .title {
    margin-bottom: 1rem;
  }

  .desc {
    font-size: 1.2rem;
    color: var(--text-desc);
  }
</style>