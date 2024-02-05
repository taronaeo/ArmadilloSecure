<script lang="ts">
  // import { getBlob, ref } from 'firebase/storage';
  import logo from '../assets/logo.png';
  import { firestore } from '../../../main/firebase';
  // import { BUCKET_FILES } from '@armadillo/shared';
  import { appStore } from '../lib/stores';
  import { doc, getDoc } from 'firebase/firestore';

  async function hashFilePass() {
    const textAsBuffer = new TextEncoder().encode(filePass);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hash = hashArray.map((item) => item.toString(16).padStart(2, '0')).join('');

    const docRef = doc(firestore, 'files', $appStore.fileId);
    const docSnap = await getDoc(docRef);

    let fileHash = '';

    if (docSnap.exists() && docSnap.data()) {
      const data = docSnap.data();
      fileHash = data.file_encryption_hash;
      console.log(fileHash);
    }

    return hash;
  }

  // async function getFileFromFirebase() {
  //   const pathReference = ref(storage, `${BUCKET_FILES}/${$appStore.fileId}`);
  //   const fileBlob = getBlob(pathReference);
  // }

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
        <div class="mt-5">
          <input bind:value={filePass} class="inline-block w-full input input-secondary" />
        </div>
        <div class="mt-8 text-center">
          <button on:click={hashFilePass} class="btn btn-secondary">Proceed</button>
        </div>
      </div>
    </div>
  </div>
</div>
