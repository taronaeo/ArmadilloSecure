<script lang="ts">
  import logo from '../assets/logo(normal).png';

  async function launchFile() {
    await window.api.launchFile('launchFile', 'abc123');
  }
</script>

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
          <div class="my-8 text-center">
            <button on:click={launchFile} class="btn bg-secondary text-neutral w-24">
                View Document
            </button>
          </div>
        </div>
      </div>
    </div>
</div>