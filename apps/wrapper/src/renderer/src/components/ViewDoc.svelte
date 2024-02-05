<script lang="ts">
  import logo from '../assets/logo.png';
  import exclamation from '../assets/exclamation.svg';

  let hasDefaultProgram = true;
  let launchFileFailed = false;
  let fileExtension = 'docx'; //temp code

  async function launchFile(): Promise<void> {
    const defaultProgram = await window.api.defaultProgram();
    if (defaultProgram === '') {
      hasDefaultProgram = false;
      return;
    }
    const fileLaunched = await window.api.launchFile('abc123');
    if (!fileLaunched) {
      launchFileFailed = true;
      return;
    }
  }
</script>

{#if !hasDefaultProgram}
  <div class="fixed flex justify-center items-center inset-0 w-full bg-black/50 z-10">
    <div class="text-center py-6 px-12 w-1/3 bg-neutral rounded">
      You do not have the default program to launch
      <span class="text-secondary">{fileExtension}</span>
      files<br />
      <button
        on:click={() => {
          hasDefaultProgram = true;
        }}
        class="btn btn-secondary mt-4">Close</button>
    </div>
  </div>
{/if}

<div class="flex">
  <div class="grid grid-cols-4 items-center">
    <div class=" border-r-2 h-screen border-neutral">
      <img src={logo} alt="logo" class="h-24 mx-auto mt-6" />
      <div class="text-center font-bold text-lg"> Armadillo Verification Process</div>
      <div class="flex flex-col">
        <div class="py-6 px-4 mt-8">File Classification</div>
        <div class="py-6 px-4">Compromisation Check</div>
        <div class="py-6 px-4">Authentication</div>
        <div class="py-6 px-4 text-secondary bg-neutral">View Document</div>
      </div>
    </div>
    <div class="m-6 col-span-3">
      {#if launchFileFailed}
        <div
          class="text-left -mt-6 my-4 p-4 flex flex-row gap-1 text-sm text-neutral bg-secondary rounded-lg">
          <img class="inline h-5 mt-1" src={exclamation} alt="exclamation svg" />
          File could not launch properly.
        </div>
      {/if}
      <h1 class="text-2xl font-bold">View Document</h1>
      <div class="py-6">
        <div class="font-normal">
          Click to launch program to view document. This document will
          <span class="text-secondary">NOT</span> be saved on this computer.
        </div>
        <div class="my-8 text-center">
          <button on:click={launchFile} class="btn bg-secondary text-neutral w-24">
            View Document
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
