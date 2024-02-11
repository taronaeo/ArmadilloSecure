<script lang="ts">
  import { appStore } from '../lib/stores';
  import logo from '../assets/logo.png';

  function swapToLiveness() {
    appStore.update((state) => ({
      ...state,
      currentState: 'faceLiveness',
    }));
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
        <div class="py-6 px-4 text-secondary bg-neutral">Authentication</div>
        <div class="py-6 px-4">View Document</div>
      </div>
    </div>
    <div class="m-6 col-span-3">
      <h1 class="text-2xl font-bold">Facial Authentication Guidelines</h1>
      <div class="py-6">
        <div>
          Make sure that you follows these guidelines or authentication will fail
          <ul class="list-decimal list-inside">
            <li>
              Be indoors in a <span class="font-bold text-secondary">sufficiently lit</span> area
            </li>
            <li>
              Light must not be <span class="font-bold text-secondary">too intensive</span>
            </li>
            <li>
              Device must be at <span class="font-bold text-secondary">100% brightness</span>
            </li>
          </ul>
        </div>
        <div class="my-8 text-center">
          <button on:click={swapToLiveness} class="btn btn-secondary">Proceed</button>
        </div>
      </div>
    </div>
  </div>
</div>
