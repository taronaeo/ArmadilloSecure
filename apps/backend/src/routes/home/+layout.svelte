<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores';

  $: (async () => {
    // If User is not logged in, Redirect to Login Page
    if (!$authStore) {
      return await goto('/authentication/login', { replaceState: true });
    }
    // If the user is logged in but email not verified, redirect to verification page
    if ($authStore && !$authStore.email_verified) {
      return await goto('/onboard/verification', { replaceState: true });
    }

    // If the user is logged in & is not onboarded, redirect to onboard/details
    if ($authStore && !$authStore.is_onboarded) {
      return await goto('/onboard/details', { replaceState: true });
    }
  })();
</script>

{#if $authStore}
  <slot />
{/if}
