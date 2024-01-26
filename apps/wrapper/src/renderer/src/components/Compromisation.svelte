<script lang="ts">
  import { onMount } from 'svelte';
  import logo from '../assets/logo.png';
  import { appState } from '../stores';

  onMount(() => {
    checkCompromisation();
  });

  async function checkCompromisation(): Promise<void> {
    const response = await window.api.checkCompromisation();
    if (response.code != 200) {
      appState.update((state) => ({
        ...state,
        passedCheck: false,
      }));
      return;
    } else {
      appState.update((state) => ({
        ...state,
        currentState: 'viewDoc',
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
