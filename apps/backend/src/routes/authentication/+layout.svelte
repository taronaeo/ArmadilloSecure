<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores';

  $: (async () => {
    // If the user is not logged in, redirect to login page
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

    // If the user is logged in & onboarded, redirect directly to Home Page
    if ($authStore && $authStore.is_onboarded) {
      return await goto('/home', { replaceState: true });
    }
  })();
</script>

{#if $authStore === null}
  <slot />
{/if}
