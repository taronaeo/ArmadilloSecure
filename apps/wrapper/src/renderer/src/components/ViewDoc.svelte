<script lang="ts">
  import logo from '../assets/logo(normal).png';

  let hasDefaultProgram = true;
  let fileExtension = 'docx'; //temp code

  async function launchFile(): Promise<void> {
    const response = await window.api.hasDefaultProgram('hasDefaultProgram');
    if (response.code !== 200) {
      hasDefaultProgram = false;
      return;
    }
    await window.api.launchFile('launchFile', 'abc123');
  }
</script>

{#if !hasDefaultProgram}
  <div class="fixed flex justify-center items-center inset-0 w-full bg-black/50 z-10">
    <div class="text-center py-6 px-12 w-1/3 bg-neutral rounded">
      You do not have the default program to launch <span class="text-secondary"
        >{fileExtension}</span>
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
      <h1 class="text-2xl font-bold">View Document</h1>
      <div class="py-6">
        <div class="font-normal">
          Click to launch program to view document. This document will <span class="text-secondary"
            >NOT</span> be saved on this computer.
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
