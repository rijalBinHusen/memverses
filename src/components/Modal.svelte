<script lang="ts">

  import { createEventDispatcher } from "svelte";

  export let isOpen = false;
  export let title: string = "";

  const dispatch = createEventDispatcher();

  function closeTheModal () {
    dispatch("closeModal");
  }

  </script>
<body>
<!-- The Modal -->
<div id="myModal" class="modal" class:active={isOpen}>

  <!-- Modal content -->
  <div class="modal-content">
    
    <div class="modal-title">
      <button class="close" on:click={closeTheModal}>&times;</button>
      <h1>{title || "Tambahkan data"}</h1>
    </div>
    <slot />
  </div>


</div>
</body>

<style lang="scss">
  @import "../scss/variables";

  /* The Modal (background) */
  .modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    padding-top: 100px; /* Location of the box */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  }

  .modal.active {
    display: block;
  }
  
  /* Modal Content */
  .modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    max-width: $width-max;
  }
  
  /* The Close Button */
  .close {
    color: #aaaaaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    background-color: $danger-color;
    color: black;
    padding: $padding-button;
    border-radius: 50%;
    border: 3px solid $primary-color;
  }
  
  .close:hover,
  .close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
  }
  </style>
  
  