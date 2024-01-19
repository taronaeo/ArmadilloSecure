<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores';

  $: (async () => {
    // If User is not logged in, Redirect to Login Page
    if (!$authStore) {
      return await goto('/authentication/login', { replaceState: true });
    }
  })();
</script>

{#if $authStore}
  <slot />
{/if}
