<script lang="ts">
  import logo from './assets/logo(normal).png';
  import { onMount } from 'svelte';

  let appName = '';
  onMount(async () => {
    appName = await window.api.getAppName('getAppName');
    console.log(appName);
  });
</script>

<div class="text-center mt-20 -mb-24 text-3xl font-bold">Armadillo Verification</div>

<div class="h-screen grid">
  <div class="place-self-center">
    <img src={logo} class="h-52 mb-4 m-auto" alt="iwnacry" />

    <h1 class="text-center text-lg"
      >You are trying to access file:
      <span class="text-secondary">
        {#if appName === ''}
          loading
        {:else}
          {appName}
        {/if}
      </span>
    </h1>
    <h1 class="font-bold text-center text-lg"
      >File Classification:
      <span class="font-normal text-secondary">placeholder </span>
    </h1>
    <div class="flex justify-center pt-4">
      <button class="btn bg-secondary text-neutral">Proceed</button>
    </div>
  </div>
</div>
