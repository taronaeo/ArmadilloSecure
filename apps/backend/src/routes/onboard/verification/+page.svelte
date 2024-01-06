<!-- JavaScript code -->
<script lang="ts">
  import { firestore } from '$lib/firebase';
  import { authStore } from '$lib/stores';
  import { doc, getDoc } from 'firebase/firestore';

  // JavaScript code for Loading Button animation
  let checkLoading = false;

  // Get user UID
  const uid = $authStore?.uid || 'defaultUid';

  // Function to Get user Details
  async function getUserDetails() {
    const docRef = doc(firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists) {
      throw Error('Sign In');
    }
    return docSnap.data();
  }
</script>

<svelte:head>
  <title>Email Verification</title>
</svelte:head>

<!-- Armadillo Logo-->
<div class="flex items-center justify-center p-10">
  <img src="armadillo.png" alt="" />
</div>

<div class="flex flex-row items-center justify-center">
  <!-- Email Verification - Card -->
  <div class="w-full max-w-2xl p-10 border border-secondary rounded-md shadow-lg">
    <!-- Email Verification - Header -->
    <h1 class="text-3xl font-semibold text-center mb-5">Please verify your email!</h1>

    <!-- Email Verification - Content -->
    <div class="text-center">
      <p>You're almost there! We have sent an email to</p>

      <!-- User Details -->
      {#await getUserDetails() then userDetails}
        {#if userDetails}
          <div class="text-info">
            {#if userDetails.email}
              {userDetails.email.slice(0, 1) +
                '*****' +
                userDetails.email.slice(userDetails.email.indexOf('@'))}
            {/if}
          </div>
        {/if}
      {:catch}
        <span class="text-error">Error, Something Went Wrong! Please Try Again</span>
      {/await}

      <br />
      <p>Click on the link in the Email to verify your email</p>
      <p>If you don't see it, <span class="bold">check your spam</span> folder</p>
      <br />
      <p>Still can't find the email?</p>
      <button
        type="submit"
        on:click={() => (checkLoading = true)}
        class="
          w-24 mt-4 mb-2 btn btn-secondary
					hover:ring-2 hover:ring-info">
        <span>
          {#if checkLoading}
            <span class="loading loading-spinner"></span>
          {:else}
            Resend
          {/if}
        </span>
      </button>
      <p>
        Need help?
        <a class="text-secondary hover:text-info duration-300" href="/">Contact us</a>
      </p>
    </div>
  </div>
</div>
