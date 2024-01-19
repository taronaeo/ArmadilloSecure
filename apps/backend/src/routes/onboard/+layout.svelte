<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores';

  $: (async () => {
    //If the user is not logged in, Redirect to loginpage
    if (!$authStore) return await goto('/authentication/login', { replaceState: true });

    // If the user is Logged in but email not verified, redirect to verification page
    if ($authStore && !$authStore.email_verified)
      return await goto('/onboard/verification', { replaceState: true });

    // If the user is Logged in and email is verified, redirect to home page
    if ($authStore && $authStore.email_verified)
      return await goto('/onboard/details', { replaceState: true });
  })();
</script>

{#if $authStore}
  <slot />
{/if}
