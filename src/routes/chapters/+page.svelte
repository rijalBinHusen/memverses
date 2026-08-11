<script lang="ts">
  import VerticalFeed from './VerticalFeed.svelte';

  // Menyediakan data dari parent component
  const myData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Konten ke-${i + 1}`,
    desc: `Ini deskripsi untuk konten ${i + 1} dari parent component.`
  }));
</script>

<VerticalFeed items={myData} />