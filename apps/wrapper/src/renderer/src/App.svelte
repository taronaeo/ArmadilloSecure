<script lang="ts">
  import type { AppState } from '@armadillo/shared';

  import { authStore } from './lib/stores';

  import { appState } from './stores';
  import { onMount } from 'svelte';

  import logo from './assets/logo.png';
  import WifiLogo from './assets/no-wifi.png';

  import Failed from './components/Failed.svelte';
  import FileClass from './components/Fileclass.svelte';
  import Compromisation from './components/Compromisation.svelte';
  import ViewDoc from './components/ViewDoc.svelte';
  import FaceLiveness from './components/FaceLiveness.svelte';

  // Preload auth state
  $authStore;

  let pingFailed = false;
  let initialPingDone = false;
  let appStateObj: AppState = {
    passedCheck: undefined,
    currentState: undefined,
    pingFailed: false,
  };

  appState.subscribe((state) => {
    appStateObj = state;
  });

  onMount(async () => {
    await window.api.ping();

    setTimeout(async () => {
      const response = await window.api.checkPing();

      if (response.code !== 200) {
        pingFailed = true;
      } else {
        pingFailed = false;
      }

      initialPingDone = true;

      appState.set({
        passedCheck: true,
        currentState: 'fileClass',
        pingFailed: false,
      });
    }, 900);
  });

  setInterval(async () => {
    await window.api.ping();

    const response = await window.api.checkPing();

    if (response.code !== 200) {
      pingFailed = true;
    } else {
      pingFailed = false;
    }
  }, 1000);
</script>

{#if !appStateObj.passedCheck}
  <Failed />
{:else if appStateObj.passedCheck}
  {#if initialPingDone}
    {#if pingFailed}
      <div class="grid h-screen">
        <div class="place-self-center">
          <img src={WifiLogo} alt="no internet" class="m-auto h-40" />
          Internet connection lost. Please check your Internet connection.
        </div>
      </div>
    {:else if !appStateObj.pingFailed}
      {#if appStateObj.currentState === 'fileClass'}
        <div>
          <FileClass />
        </div>
      {:else if appStateObj.currentState === 'compromisationCheck'}
        <div>
          <Compromisation />
        </div>
      {:else if appStateObj.currentState === 'viewDoc'}
        <div>
          <ViewDoc />
        </div>
      {/if}
    {/if}
  {:else if !initialPingDone}
    <h1 class="text-center mt-20 -mb-32 text-3xl font-bold">Armadillo Verification</h1>

    <div class="h-screen grid">
      <div class="place-self-center">
        <img src={logo} class="h-52 mb-4 m-auto" alt="logo" />
        <h1 class="text-center text-lg mb-2">Checking Internet Connection </h1>
        <div class="text-center">
          <span class="loading loading-bars loading-lg text-secondary"></span>
        </div>
      </div>
    </div>
  {/if}
{/if}
