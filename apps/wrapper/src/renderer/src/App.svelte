<script>
  import { authStore } from './lib/stores';
  import FaceLiveness from './components/FaceLiveness.svelte';

  // Preload auth state
  $authStore;
</script>

<!-- <h1 class="text-4xl font-bold">Hello World from Electron and NYP</h1> -->

<FaceLiveness clientId={'abc'} />
