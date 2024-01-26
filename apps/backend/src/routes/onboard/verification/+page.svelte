<!-- JavaScript code -->
<script lang="ts">
  // Imports
  import { firestore } from '$lib/firebase';
  import type { FirebaseError } from 'firebase/app';
  import { authStore, authState } from '$lib/stores';
  import { doc, getDoc } from 'firebase/firestore';
  import { verifyEmail, signOut } from '$lib/firebase/auth';

  // State variable
  let apiError: FirebaseError | null;
</script>

<svelte:head>
  <title>Email Verification</title>
</svelte:head>

<div class="mt-32 flex flex-row items-center justify-center">
  <!-- Email Verification - Card -->
  <div class="w-full max-w-2xl p-10 border border-secondary rounded-md shadow-lg">
    <!-- Email Verification - Header -->
    <h1 class="text-3xl font-semibold text-center mb-5">Please verify your email!</h1>

    <!-- Email Verification - Content -->
    <div class="text-center">
      <p>You're almost there! We have sent an email to</p>

      <!-- User Details -->
      {#if $authStore?.email}
        <div class="text-info">
          {$authStore?.email.slice(0, 1) +
            '*****' +
            $authStore?.email.slice($authStore?.email.indexOf('@'))}
        </div>
      {:else}
        <span class="text-error">Loading user data...</span>
      {/if}

      <p class="mt-5">Click on the link in the Email to verify your email</p>
      <p>
        After verifying, Please
        <button
          class="btn btn-active btn-link p-0"
          on:click={() => signOut((error) => (apiError = error))}>
          Log Out
        </button>
        and Log back into the account
      </p>

      <p class="mt-5">Still can't find the email?</p>
      <button
        type="submit"
        class="
          w-24 mt-4 mb-2 btn btn-secondary
          hover:ring-2 hover:ring-info"
        on:click={() => {
          if ($authState) {
            verifyEmail($authState, (error) => (apiError = error));
          }
        }}>
        <span> Resend </span>
      </button>
      {#if apiError}
        <p class="text-red-600">Error: {apiError.message}</p>
      {/if}
      <p>
        Need help?
        <a class="text-secondary hover:text-info duration-300" href="/">Contact us</a>
      </p>
    </div>
  </div>
</div>
