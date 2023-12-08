<script lang="ts">
  import logo from '../assets/logo(normal).png';
  import Failed from './Failed.svelte';
  import { onMount } from 'svelte';

  const fileClass = '3';
  //to be changed when firestore cloud func is up
  let appName = '';
  let passedCheck = false;
  let proceed = false;
  let checkLoading = false;
  let proceedToCompromisation = false;

  onMount(async () => {
    appName = await window.api.getAppName('getAppName');
  });

  let response: { code?: number; message?: string } = {};
  async function checkFileClass() {
    if (fileClass === '3') {
      checkLoading = true;
      response = await window.api.secretChecks('secretChecks');
      proceed = true;
      if (response.code === 200) {
        passedCheck = true;
      }
    } else {
      proceed = true;
      passedCheck = true;
    }
  }
</script>

<div class:hidden={proceedToCompromisation}>
<div class="hidden" class:hidden={proceed}>
  <h1 class="text-center mt-20 -mb-24 text-3xl font-bold">Armadillo Verification</h1>

  <div class="h-screen grid">
    <div class="place-self-center">
      <img src={logo} class="h-52 mb-4 m-auto" alt="logo" />

      <h1 class="text-center text-lg"
        >You are trying to access file:
        <span class="text-secondary">
          {#if appName === ''}
            <span class="text-white loading loading-spinner loading-md mx-2 -mb-2"></span>
          {:else}
            {appName}
          {/if}
        </span>
      </h1>
      <h1 class="font-bold text-center text-lg"
        >File Classification:
        <span class="font-normal text-secondary">
          {#if fileClass === '3'}
            Top Secret
          {:else if fileClass === '2'}
            Sensitive
          {:else if fileClass === '1'}
            Open
          {/if}
        </span>
        <!--To be changed when firestore cloud func is up-->
      </h1>
      <div class="flex justify-center pt-4">
        <button on:click={checkFileClass} class="w-24 btn bg-secondary text-neutral">
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

{#if passedCheck}
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
            {#if fileClass === '3'}
              Top Secret
              <div class="text-white">
                You have passed the verification test for files of the <span class="text-secondary"
                  >Top Secret</span>
                classification, you may proceed to the
                <span class="font-bold">Compromisation Check</span> step.
              </div>
            {:else if fileClass === '2'}
              Sensitive
            {:else if fileClass === '1'}
              Open
              <div class="text-white">
                Since the file is of <span class="text-secondary">Open</span> classification, the following
                verification steps will be skipped.</div>
            {/if}
          </div>
          <div class="my-8 text-center">
            <button on:click={() => {proceedToCompromisation = true;}} class="btn bg-secondary text-neutral">Proceed</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if !passedCheck}
  <Failed/>
{/if}

</div>

