
<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
</svelte:head>

<div class="container">
    
    <slot></slot>
</div>

<style lang="scss">
    @import "./layout.scss";
    body {
        height: 100svh;
        width: 100svw;
    }
</style>