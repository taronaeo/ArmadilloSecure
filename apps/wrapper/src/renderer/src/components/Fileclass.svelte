<script lang="ts">
  import type { IpcResponse } from '@armadillo/shared';

  import logo from '../assets/logo.png';
  import { onMount } from 'svelte';
  import { appState } from '../stores';

  let fileClass = '';
  let appName = '';
  let proceed = false;
  let checkLoading = false;

  onMount(async () => {
    await window.api.getFileClass('3be2565e-fe51-4e9d-820f-d6c1315d204d');
    let classInterval = setInterval(async () => {
      const fileClassResponse = await window.api.checkFileClass();
      if (fileClassResponse.code === 200) {
        fileClass = fileClassResponse.message;
        clearInterval(classInterval);
      }
    }, 1000);
    const appNameRes = await window.api.getAppName();
    appName = appNameRes.message;
  });

  async function topSecretChecks() {
    if (fileClass === 'TOPSECRET') {
      checkLoading = true;
      const response: IpcResponse = await window.api.secretChecks();
      proceed = true;
      console.log(response.code);
      if (response.code === 200) {
        appState.update((state) => ({
          ...state,
          currentState: 'fileClass',
        }));
      } else {
        proceed = false;
        appState.update((state) => ({
          ...state,
          passedCheck: false,
        }));
      }
    } else if (fileClass === 'SENSITIVE') {
      proceed = true;
      appState.update((state) => ({
        ...state,
        currentState: 'fileClass',
      }));
    } else if (fileClass === 'OPEN') {
      proceed = true;
      appState.update((state) => ({
        ...state,
        currentState: 'viewDoc',
      }));
    }
  }
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
      <h1 class="font-bold text-center text-lg">
        File Classification:
        <span class="font-normal text-secondary">
          {#if fileClass === 'TOPSECRET'}
            Top Secret
          {:else if fileClass === 'SENSITIVE'}
            Sensitive
          {:else if fileClass === 'OPEN'}
            Open
          {:else}
            <span class="loading loading-spinner loading-sm mx-2 -mb-2"></span>
          {/if}
        </span>
        <!--To be changed when firestore cloud func is up-->
      </h1>
      <div class="flex justify-center pt-4">
        <button
          disabled={fileClass === ''}
          on:click={topSecretChecks}
          class="w-24 btn bg-secondary text-neutral">
          <span>
            {#if checkLoading}
              <span class="loading loading-spinner loading-sm"></span>
            {:else}
              Proceed
            {/if}
          </span>
        </button>
      </div>
    </div>
  </div>
</div>

<div class:hidden={!proceed} class="flex">
  <div class="grid grid-cols-4 items-center">
    <div class=" border-r-2 h-screen border-neutral">
      <img src={logo} alt="logo" class="h-24 mx-auto mt-6" />
      <div class="text-center font-bold text-lg"> Armadillo Verification Process</div>
      <div class="flex flex-col">
        <div class="py-6 px-4 mt-8 text-secondary bg-neutral">File Classification</div>
        <div class="py-6 px-4">Compromisation Check</div>
        <div class="py-6 px-4">Authentication</div>
        <div class="py-6 px-4">View Document</div>
      </div>
    </div>
    <div class="m-6 col-span-3">
      <h1 class="text-2xl font-bold">File Classification</h1>
      <div class="py-6">
        Classification of File Requested:
        <div class="text-secondary inline">
          {#if fileClass === 'TOPSECRET'}
            Top Secret
            <div class="text-white">
              You have passed the verification test for files of the
              <span class="text-secondary">Top Secret</span>
              classification, you may proceed to the
              <span class="font-bold">Compromisation Check</span> step.
            </div>
          {:else if fileClass === 'SENSITIVE'}
            Sensitive
          {:else if fileClass === 'OPEN'}
            Open
            <div class="text-white">
              Since the file is of <span class="text-secondary">Open</span> classification, the following
              verification steps will be skipped.
            </div>
          {/if}
        </div>
        <div class="my-8 text-center">
          <button
            on:click={() => {
              appState.update((state) => ({
                ...state,
                currentState: 'compromisationCheck',
              }));
            }}
            class="btn bg-secondary text-neutral">Proceed</button>
        </div>
      </div>
    </div>
  </div>
</div>
