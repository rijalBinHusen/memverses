<script lang="ts">
  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
  }

  export let onAddVerse: () => void;
  export let onMoveTo: () => void;
  export let onShare: () => void;
  export let onDelete: () => void;

  function handleOption(action: string) {
    console.log(`Action selected: ${action}`);
    isOpen = false;
  }

  function handleOutsideClick(node: any) {
    const handleClick = (event: MouseEvent) => {
      if (isOpen && !node.contains(event.target)) {
        isOpen = false;
      }
    };

    document.addEventListener('click', handleClick, true);

    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }
</script>

<div class="menu-container" use:handleOutsideClick>
  <!-- Floating Menu (positioned above) -->
  {#if isOpen}
    <div class="options-menu">
      <button on:click={() => onAddVerse() }>Tambah</button>
      <button on:click={() => onMoveTo() }>Pindah ke</button>
      <button on:click={() => onShare() }>Bagikan</button>
      <button class="delete-btn" on:click={() => onDelete() }>Delete</button>
    </div>
  {/if}

  <!-- Vertical Three-Dot Options Button -->
  <button 
    class="options-btn" 
    on:click={toggleMenu} 
    aria-label="Options" 
    aria-expanded={isOpen}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  </button>
</div>

<style lang="scss">

    @import "../../scss/variables";

    .menu-container {
        position: relative;
        display: inline-block;
    }

    /* Main options toggle button */
    /* Style for the button */
    .options-btn {
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

    .options-btn:hover {
        background-color: #0056b3;
    }
    
    /* Popover menu positioned ABOVE the button */
    .options-menu {
        position: absolute;
        bottom: 100%; /* Positions bottom edge at top edge of button */
        right: 0;
        margin: 0 8px 8px 0; /* Gap between button and menu */
        display: flex;
        flex-direction: column;
        min-width: 140px;
        background-color:  var(--bg-body);
        border: 1px solid var(--text-main);
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        padding: 4px;
        z-index: 50;
    }

    .options-menu button {
        display: block;
        width: 100%;
        padding: 8px 12px;
        text-align: left;
        background: transparent;
        border: none;
        border-radius: 4px;
        font-size: 0.875rem;
        color: var(--text-main);
        cursor: pointer;
        transition: background-color 0.15s ease;
    }

    .options-menu button:hover {
        background-color: var(--bg-feed);
    }

    .options-menu .delete-btn {
        color: #dc2626;
    }

    .options-menu .delete-btn:hover {
        background-color: var(--bg-feed);
    }
</style>