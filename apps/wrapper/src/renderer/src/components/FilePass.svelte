<script lang="ts">
  import type {
    CFCallableGetPasswordRequest,
    CFCallableGetPasswordResponse,
  } from '@armadillo/shared';

  import { appStore } from '../lib/stores';
  import { getHttpsCallable } from '../../../main/firebase/functions';

  import logo from '../assets/logo.png';

  let tryCounter = 0;

  async function hashFilePass() {
    const textAsBuffer = new TextEncoder().encode(filePass);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hash = hashArray.map((item) => item.toString(16).padStart(2, '0')).join('');

    try {
      const getFilePasswordAPI = getHttpsCallable<
        CFCallableGetPasswordRequest,
        CFCallableGetPasswordResponse
      >('https_onCall_getPassword');

      const backendStore = await window.api.getBackendStore();
      const clientId = backendStore.clientId;
      const fileId = backendStore.fileId;

      const filePassRes = await getFilePasswordAPI({
        origin: 'wrapper',
        clientId: clientId,
        fileId: fileId,
        fileEncryptionHash: hash,
      });
      appStore.update((state) => ({
        ...state,
        currentState: 'viewDoc',
        fileHash: hash,
        fileExt: filePassRes.data.fileExt,
        fileOwner: filePassRes.data.fileOwner,
      }));
    } catch (err) {
      tryCounter += 1;
      if (tryCounter === 3) {
        appStore.update((state) => ({
          ...state,
          passedCheck: false,
          errorMsg: 'File Password Entered Wrong',
        }));
      }
    }

    return hash;
  }

  let filePass = '';
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
      <h1 class="text-2xl font-bold">File is Locked</h1>
      <div class="py-6">
        <div> Please key in the file password below </div>
        <div>You have <span class="text-secondary">{3 - tryCounter}</span> tries left.</div>
        <div class="mt-5">
          <input
            bind:value={filePass}
            type="password"
            class="inline-block w-full input input-secondary" />
        </div>
        <div class="mt-8 text-center">
          <button on:click={hashFilePass} class="btn btn-secondary">Proceed</button>
        </div>
      </div>
    </div>
  </div>
</div>
