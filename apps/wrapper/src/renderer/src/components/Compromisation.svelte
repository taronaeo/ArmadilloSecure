<script lang="ts">
  import { onMount } from 'svelte';
  import { appStore } from '../lib/stores';

  import logo from '../assets/logo.png';

  onMount(() => {
    checkCompromisation();
  });

  async function checkCompromisation(): Promise<void> {
    try {
      await window.api.checkCompromisation();

      let nextState = 'livenessWarning';

      if ($appStore.fileClass === 'OPEN') {
        nextState = 'filePass';
      }

      appStore.update((state) => ({
        ...state,
        currentState: nextState,
      }));
    } catch {
      appStore.update((state) => ({
        ...state,
        passedCheck: false,
        errorMsg: 'Compromisation Check Failed',
      }));
    }
  }
</script>

<div class="flex">
  <div class="grid grid-cols-4 items-center">
    <div class=" border-r-2 h-screen border-neutral">
      <img src={logo} alt="logo" class="h-24 mx-auto mt-6" />
      <div class="text-center font-bold text-lg"> Armadillo Verification Process</div>
      <div class="flex flex-col">
        <div class="py-6 px-4 mt-8">File Classification</div>
        <div class="py-6 px-4 text-secondary bg-neutral">Compromisation Check</div>
        <div class="py-6 px-4">Authentication</div>
        <div class="py-6 px-4">View Document</div>
      </div>
    </div>
    <div class="m-6 col-span-3">
      <h1 class="text-2xl font-bold">Compromisation Check</h1>
      <div class="py-6">
        <div>
          Check if computer is compromised (<span class="text-secondary">Windows Defender</span>)
        </div>
        <br />
        <div>
          Windows Defender must have:
          <ul class="list-decimal list-inside">
            <li
              >Performed a <span class="font-bold">FULL</span> scan in the past
              <span class="text-secondary">24 hours</span></li>
            <li
              >Antivirus signatures must be updated in the past
              <span class="text-secondary">1 month</span>
            </li>
          </ul>
        </div>
        <div class="my-8 text-center">
          <span class="loading loading-spinner loading-lg text-secondary"> </span></div>
      </div>
    </div>
  </div>
</div>
