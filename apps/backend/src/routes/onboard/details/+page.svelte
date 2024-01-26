<!-- JavaScript code for Continue button -->
<script lang="ts">
  import { createForm } from 'svelte-forms-lib';
  import type { FirebaseError } from 'firebase/app';
  import * as yup from 'yup';
  import { authStore } from '$lib/stores';
  import { firestore } from '$lib/firebase';
  import { doc, setDoc } from 'firebase/firestore';

  // State variable
  let apiError: FirebaseError | null;
  let checkLoading = false;

  // Form + Yup validation
  const { form, errors, handleChange, handleSubmit } = createForm({
    initialValues: {
      fullName: '',
    },
    validationSchema: yup.object().shape({
      fullName: yup.string().required('Full name is a required field'),
    }),

    // On submit, if the user isn't logged in, do not continue the process, else populate the data and determine onboard true
    onSubmit: async (data) => {
      if (!$authStore) return;
      const uid = $authStore.uid;
      checkLoading = true;

      const userDocRef = doc(firestore, 'users', uid);
      await setDoc(
        userDocRef,
        {
          full_name: data.fullName,
          is_onboarded: true,
        },
        {
          merge: true,
        }
      ).catch((error) => {
        apiError = error;
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

    <!-- Onboard Form - Link to Login -->
    <p class="text-center">
      Already have an account?
      <a class="text-secondary hover:text-info duration-300" href="/authentication/login">
        Log in
      </a>
    </p>
  </div>
</div>
