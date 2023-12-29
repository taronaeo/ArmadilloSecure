<!-- JavaScript code -->
<script lang="ts">
  // import for forms
  import { createForm } from 'svelte-forms-lib';

  import { authStore } from '$lib/stores';
  import type { FirebaseError } from 'firebase/app';

  // import sign up function
  import { signOut, signInEmailPassword } from '$lib/firebase/auth';

  //import yup for form validation
  import * as yup from 'yup';

  let apiError: FirebaseError | null;

  // JavaScript code for Loading Button animation
  let checkLoading = false;

  // Yup validation code
  const { form, errors, handleChange, handleSubmit } = createForm({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().email().required('Please enter your Email.'),
      password: yup.string().required('Please enter your Password.'),
    }),

    onSubmit: (data) =>
      signInEmailPassword(data.email, data.password, (error) => (apiError = error)),
  });
</script>

<!-- Armadillo Logo-->
<div class="flex flex-row items-center justify-center p-10">
  <img src="armadillo.png" alt="" />
</div>

<div class="flex flex-row items-center justify-center">
  <!-- Login Form - Card -->
  <div class="w-full max-w-lg p-10 border border-secondary rounded-md shadow-lg">
    <!-- Login Form - Header -->
    <h2 class="text-3xl font-semibold text-center mb-5">Welcome Back</h2>

    <!-- Login Form - Form Content -->
    <form on:submit|preventDefault={handleSubmit}>
      <!-- General Error Message -->
      {#if apiError && (apiError.code === 'auth/user-not-found' || apiError.code === 'auth/wrong-password')}
        <div class="p-4 flex flex-row bg-red-50 text-red-800 rounded-lg" role="alert">
          <img src="errorlogo.svg" alt="Error, Please Try Again Later." />
          <div class="ml-2 text-sm font-medium">Invalid email or password, please try again</div>
        </div>
      {/if}

      <!-- Form Content - Email Input -->
      <div>
        <label for="email" class="form-control w-full max-w-md">
          <div class="label">
            <span class="label-text">Email</span>
          </div>
          <input
            id="email"
            type="text"
            name="email"
            placeholder="Name@example.com"
            on:change={handleChange}
            bind:value={$form.email}
            class="
              w-full max-w-md input input-bordered duration-300
              focus:ring-secondary focus:border-secondary focus:outline-none
						" />
        </label>
        <div>
          <span class="text-red-600">{$errors.email}</span>
        </div>
      </div>

      <!-- Form Content - Password Input -->
      <div>
        <label for="password" class="form-control w-full max-w-md">
          <div class="label">
            <span class="label-text">Password</span>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            on:change={handleChange}
            bind:value={$form.password}
            class="
              w-full max-w-md input input-bordered duration-300
              focus:ring-secondary focus:border-secondary focus:outline-none
						" />
        </label>
        <div>
          <span class="text-red-600">{$errors.password}</span>
        </div>
      </div>

      <!-- Form Content - Submit/Continue Button -->
      <button
        type="submit"
        on:click={() => (checkLoading = true)}
        class="
          w-full max-w-2xl mt-8 mb-2 btn btn-secondary
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

    <!-- Login Form - Link to Sign up -->
    <p class="text-center">
      Don't have an account?
      <a class="text-secondary hover:text-info duration-300" href="/signup">Sign Up</a>
    </p>
  </div>
</div>
