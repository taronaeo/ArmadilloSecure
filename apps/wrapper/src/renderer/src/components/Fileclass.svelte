<script lang="ts">
  import logo from '../assets/logo.png';
  import { onMount } from 'svelte';
  import { appStore } from '../lib/stores';

  let fileClass = '';

  let appName = '';
  let proceed = false;

  onMount(async () => {
    appName = await window.api.getAppName();

    try {
      fileClass = await window.api.getFileClass();
    } catch {
      appStore.update((state) => ({
        ...state,
        passedCheck: false,
        errorMsg: 'File Classification Check Failed',
      }));
      return;
    }
    console.log(fileClass);

    if (fileClass === 'TOPSECRET' || fileClass === 'SENSITIVE') {
      proceed = true;

      appStore.update((state) => ({
        ...state,
        currentState: 'compromisationCheck',
      }));
    } else if (fileClass === 'OPEN') {
      proceed = true;

      appStore.update((state) => ({
        ...state,
        currentState: 'viewDoc',
      }));
    }
  });
</script>

<div class="hidden" class:hidden={proceed}>
  <h1 class="text-center mt-20 -mb-24 text-3xl font-bold">Armadillo Verification</h1>

  <div class="h-screen grid">
    <div class="place-self-center">
      <img src={logo} class="h-52 mb-4 m-auto" alt="logo" />

      <h1 class="text-center text-lg">
        You are trying to access file:
        <span class="text-secondary">
          {#if appName === ''}
            <span class="text-white loading loading-spinner loading-md mx-2 -mb-2"></span>
          {:else}
            {appName}
          {/if}
        </span>
      </h1>
      <div class="text-center text-lg"> Getting File Class </div>

      <!--To be changed when firestore cloud func is up-->
      <div class="flex justify-center pt-4">
        <span class="loading loading-spinner text-secondary"></span>
      </div>
    </div>
  </div>
</div>
