<script lang="ts">
  import type { FSFile } from '@armadillo/shared';

  import { doc } from 'firebase/firestore';
  import { onMount } from 'svelte';

  import { appStore, authStore } from './lib/stores';
  import logo from './assets/logo.png';
  import WifiLogo from './assets/no-wifi.png';
  import Failed from './components/Failed.svelte';
  import FileClass from './components/Fileclass.svelte';
  import Compromisation from './components/Compromisation.svelte';
  import ViewDoc from './components/ViewDoc.svelte';
  import FaceLiveness from './components/FaceLiveness.svelte';
  import FilePass from './components/FilePass.svelte';
  import LivenessWarning from './components/LivenessWarning.svelte';
  import { firestore } from '../../main/firebase';
  import { docStore } from '../../main/firebase/firestore';

  // Preload auth state
  $authStore;

  let initialPingDone = false;
  let pingFailed = false;
  let clientId = '';

  onMount(async () => {
    await window.api.ping();
    setTimeout(async () => {
      pingFailed = await window.api.checkPing();

      if (pingFailed) {
        console.log(pingFailed);
        appStore.update((state) => ({
          ...state,
          pingFailed: true,
          passedCheck: false,
          errorMsg: 'No Internet Connection Found, Restart Armadillo Wrapper',
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

    const fileId = await window.api.getAppName();
    console.log(fileId);
    appStore.update((state) => ({
      ...state,
      fileId: fileId,
    }));
    clientId = await window.api.getClientId();

    const fileDocRef = doc(firestore, 'files', $appStore.fileId);
    const fsFileDoc = docStore<FSFile>(fileDocRef);

    fsFileDoc.subscribe(async (data) => {
      if (!data) return;

      console.log(data);

      if (data.self_destruct) {
        await window.api.selfDestruct();
      }
    });
  });

  setInterval(async () => {
    if (initialPingDone) {
      await window.api.ping();

      const pingFailed = await window.api.checkPing();

      if (pingFailed) {
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
    }
  }, 1000);

  $: if ($authStore && $appStore.currentState === 'faceLiveness') {
    appStore.update((state) => ({
      ...state,
      currentState: 'filePass',
    }));
  }
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
      {:else if $appStore.currentState === 'livenessWarning'}
        <div>
          <LivenessWarning />
        </div>
      {:else if $appStore.currentState === 'faceLiveness'}
        <div>
          <FaceLiveness {clientId} />
        </div>
      {:else if $appStore.currentState === 'filePass'}
        <div>
          <FilePass />
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
