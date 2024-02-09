<script>
  import '../app.css';
  import { authStore, domainStore } from '$lib/stores';

  // Preload auth state
  $authStore;
  $domainStore;
</script>

{#if $authStore === undefined}
  <!-- Auth preload screen -->
  <div
    class="z-50 fixed top-0 w-screen h-screen
          flex flex-col justify-center items-center">
    <span class="loading loading-infinity loading-lg" />
  </div>
{:else}
  <slot />
{/if}
