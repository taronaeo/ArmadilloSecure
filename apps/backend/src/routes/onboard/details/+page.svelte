<!-- JavaScript code for Continue button -->
<script lang="ts">
  // Imports
  import type { FirebaseError } from 'firebase/app';
  import { doc, setDoc } from 'firebase/firestore';
  import { ref, uploadBytes } from 'firebase/storage';
  import { createForm } from 'svelte-forms-lib';
  import { firestore } from '$lib/firebase';
  import { authStore } from '$lib/stores';
  import * as yup from 'yup';
  import { fileStorage, headshotStorage } from '$lib/firebase/storage';
  import { BUCKET_HEADSHOTS } from '@armadillo/shared';

  // State variable
  let apiError: FirebaseError | null;
  let checkLoading = false;

  function isPng(filename: string) {
    if (!filename) return false;

    const fileNameArray = filename.split('.');
    const fileExt = fileNameArray[fileNameArray.length - 1];

    if (fileExt === 'png') return true;
    console.log(fileExt === 'png');

    return false;
  }

  // Form + Yup validation
  const { form, errors, handleChange, handleSubmit } = createForm({
    initialValues: {
      fullName: '',
      fileUpload: undefined,
    },
    validationSchema: yup.object().shape({
      fullName: yup.string().required('Full name is a required field'),
      fileUpload: yup
        .mixed()
        .required('Headshot is required')
        .test('is-valid-type', 'Only PNG files allowed', (value) => {
          const fileList = value as FileList;
          return isPng(fileList[0].name);
        })
        .test('is-valid-size', 'Max allowed size is 16MB', (value) => {
          const fileList = value as FileList;
          return fileList[0].size <= 16000000;
        }),
    }),

    // On submit, if the user isn't logged in, do not continue the process, else populate the data and determine onboard true
    onSubmit: async (data) => {
      if (!data.fileUpload || !data.fullName) return;

      if (!$authStore) return;
      const uid = $authStore.uid;
      checkLoading = true;

      const userDocRef = doc(firestore, 'users', uid);
      await setDoc(
        userDocRef,
        {
          full_name: data.fullName,
          is_onboarded: true,
          headshot_url: `gs://${BUCKET_HEADSHOTS}/${uid}/headshot.png`,
        },
        {
          merge: true,
        }
      ).catch((error) => {
        apiError = error;
      });

      const storageRef = ref(headshotStorage, `${uid}/headshot.png`);
      const formFileList = data.fileUpload as FileList;
      const formFileBuffer = await formFileList[0].arrayBuffer();
      uploadBytes(storageRef, formFileBuffer, {
        contentType: 'image/png',
      });

      checkLoading = false;
    },
  });
</script>

<div class="flex flex-row justify-center pt-40">
  <!-- Onboard Form - Card -->
  <div class="w-full max-w-2xl p-10 border border-secondary rounded-md shadow-lg">
    <!-- Onboard Form - Header -->
    <h1 class="text-3xl font-semibold text-center mb-5">Get Onboard</h1>

    <h2 class="text-center p-1">Complete your profile to start using Armadillo!</h2>

    <form on:submit|preventDefault={handleSubmit}>
      <!-- Onboard Form - Name Input -->
      <div>
        <label for="fullName" class="form-control w-full max-w-xl pt-2">
          <div class="label">
            <span class="label-text">Full Name</span>
          </div>
          <input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="John Doe"
            on:change={handleChange}
            bind:value={$form.fullName}
            class="
              input input-bordered w-full max-w-xl
              focus:ring-secondary focus:border-secondary duration-300 focus:outline-none
            " />
        </label>
        <div>
          <span class="text-red-600">{$errors.fullName}</span>
        </div>

        <div class="mr-4 rounded-md mt-4">
          <label for="headshot" class="">
            Headshot Upload
            <input
              id="fileUpload"
              type="file"
              name="fileUpload"
              on:change={handleChange}
              class="mt-2 file-input file-input-md w-full" />
          </label>
        </div>

        <div>
          <span class="text-red-600">{$errors.fileUpload}</span>
        </div>
      </div>

      <!-- Onboard Form - Submit/Continue Button -->
      <button
        type="submit"
        class="
          w-full max-w-xl mt-8 mb-2 btn btn-secondary
          hover:ring-2 hover:ring-info">
        <span>
          {#if checkLoading}
            <span class="loading loading-spinner"></span>
          {:else}
            Continue
          {/if}
        </span>
      </button>
    </form>
  </div>
</div>
