<script lang="ts">
  import { onMount } from 'svelte';

  import { appStore, authStore } from './lib/stores';

  import logo from './assets/logo.png';
  import WifiLogo from './assets/no-wifi.png';

  import Failed from './components/Failed.svelte';
  import FileClass from './components/Fileclass.svelte';
  import Compromisation from './components/Compromisation.svelte';
  import ViewDoc from './components/ViewDoc.svelte';
  import FaceLiveness from './components/FaceLiveness.svelte';

  // Preload auth state
  $authStore;

  let initialPingDone = false;

  let clientId = '';

  onMount(async () => {
    const clientInfo = (await window.api.getPrivIpHostName()).message;
    const privIp = clientInfo.privIp;
    const hostname = clientInfo.hostname;

    let randomDigits = '';
    for (let i = 0; i < 4; i++) {
      randomDigits += Math.floor(Math.random() * 10).toString();
    }

    clientId = `${privIp}::${hostname}::${randomDigits}`;

    await window.api.ping();
    setTimeout(async () => {
      const response = await window.api.checkPing();

      if (response.code !== 200) {
        appStore.update((state) => ({
          ...state,
          pingFailed: true,
        }));
      } else {
        appStore.update((state) => ({
          ...state,
          currentState: 'fileClass',
          pingFailed: false,
        }));
      }

      initialPingDone = true;
    }, 900);
  });

  setInterval(async () => {
    await window.api.ping();

    const response = await window.api.checkPing();

    if (response.code !== 200) {
      appStore.update((state) => ({
        ...state,
        pingFailed: true,
      }));
    } else {
      appStore.update((state) => ({
        ...state,
        pingFailed: false,
      }));
    }
  }, 1000);

  $: console.log($appStore);
</script>

{#if !$appStore.passedCheck}
  <Failed />
{:else if $appStore.passedCheck}
  {#if initialPingDone}
    {#if $appStore.pingFailed}
      <div class="grid h-screen">
        <div class="place-self-center">
          <img src={WifiLogo} alt="no internet" class="m-auto h-40" />
          Internet connection lost. Please check your Internet connection.
        </div>
      </div>
    {:else if !$appStore.pingFailed}
      {#if $appStore.currentState === 'fileClass'}
        <div>
          <FileClass />
        </div>
      {:else if $appStore.currentState === 'compromisationCheck'}
        <div>
          <Compromisation />
        </div>
      {:else if $appStore.currentState === 'faceLiveness'}
        <div>
          <FaceLiveness {clientId} />
        </div>
      {:else if $appStore.currentState === 'viewDoc'}
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
