<!-- JavaScript code -->
<script lang="ts">
  // import for forms
  import { createForm } from 'svelte-forms-lib';

  import { authStore } from '$lib/stores';
  import type { FirebaseError } from 'firebase/app';

  // import sign up function
  import { signOut, signUpEmailPassword } from '$lib/firebase/auth';

  //import yup for form validation
  import * as yup from 'yup';

  // JavaScript code for Continue button
  let apiError: FirebaseError | null;

  // JavaScript code for Checkbox button
  let trigger = false;

  // Create a reference for the password
  const passwordRef = yup.ref('password');

  function toggleCheckbox() {
    trigger = !trigger;
  }

  // Yup validation code
  const { form, errors, handleChange, handleSubmit } = createForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().email().required('Corporate Email is required.'),
      password: yup
        .string()
        .required('Password is required.')
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must be at least 8 characters long and include at least one letter, one number, and one special character.'
        ),
      confirmPassword: yup
        .string()
        .required('Confirm Password is required.')
        .oneOf([passwordRef], 'Passwords entered do not match.')
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must be at least 8 characters long and include at least one letter, one number, and one special character.'
        ),
    }),
    onSubmit: async (data) => {
      if (data.password === data.confirmPassword) {
        // This will only be executed if passwords match
        await signUpEmailPassword(data.email, data.password, (error) => (apiError = error));
        console.log('Account created successfully');
      } else {
        console.error('Passwords do not match');
      }
    },
  });
</script>

<svelte:head>
  <title>Sign Up</title>
</svelte:head>

<!-- Armadillo Logo-->
<div class="flex items-center justify-center p-10">
  <img src="armadillo.png" alt="" />
</div>

<div class="flex flex-row items-center justify-center">
  <!-- Signup Form - Card -->
  <div class="w-full max-w-2xl p-10 border border-secondary rounded-md shadow-lg">
    <!-- Signup Form - Header -->
    <h1 class="text-3xl font-semibold text-center mb-5">Create your account</h1>

    <form on:submit|preventDefault={handleSubmit}>
      <!-- General Error Message -->
      {#if apiError && apiError.code === 'auth/email-already-in-use'}
        <div class="p-4 flex flex-row bg-red-50 text-red-800 rounded-lg" role="alert">
          <img src="errorlogo.svg" alt="" />
          <div class="ml-2 text-sm font-medium"
            >You're too fast, slow down and try again in a while</div>
        </div>
      {/if}

      <!-- Signup Form - Corporate Email Input -->
      <div>
        <label for="email" class="form-control w-full max-w-2xl">
          <div class="label">
            <span class="label-text">Corporate Email Address</span>
            <span class="text-red-600 label-text-alt">*</span>
          </div>
          <input
            id="email"
            type="text"
            name="email"
            placeholder="Name@example.com"
            on:change={handleChange}
            bind:value={$form.email}
            class="
              input
              input-bordered
              w-full max-w-2xl
              focus:ring-secondary
              focus:border-secondary
              duration-300
              focus:outline-none
            " />
        </label>
        <div>
          <span class="text-red-600">{$errors.email}</span>
        </div>
      </div>

      <!-- Signup Form - Password Input -->
      <div>
        <label for="password" class="form-control w-full max-w-2xl">
          <div class="label">
            <span class="label-text">Password</span>
            <span class="text-red-600 label-text-alt">*</span>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            on:change={handleChange}
            bind:value={$form.password}
            class="
              input
              input-bordered
              w-full
              max-w-2xl
              focus:ring-secondary
              focus:border-secondary
              duration-300
              focus:outline-none
            " />
        </label>
        <div>
          <span class="text-red-600">{$errors.password}</span>
        </div>
      </div>

      <!-- Signup Form - Confirm Password Input -->
      <div>
        <label class="form-control w-full max-w-2xl">
          <div class="label">
            <span class="label-text">Confirm Password</span>
            <span class="text-red-600 label-text-alt">*</span>
          </div>
          <input
            type="password"
            name="confirmpass"
            placeholder="••••••••"
            on:change={handleChange}
            bind:value={$form.confirmPassword}
            class="
              input
              input-bordered
              w-full
              max-w-2xl
              focus:ring-secondary
              focus:border-secondary
              duration-300
              focus:outline-none
            " />
        </label>
        <div>
          <span class="text-red-600">{$errors.confirmPassword}</span>
        </div>
      </div>

      <div class="form-control mt-7">
        <label class="label cursor-pointer">
          <input
            type="checkbox"
            class="checkbox checkbox-secondary mr-5"
            bind:checked={trigger}
            on:click={toggleCheckbox} />
          <span class="label-text"
            >By signing up, you are creating a Armadillo account, and you agree to Armadillo's
            <a class="text-secondary hover:text-accent duration-300" href="/login">
              Terms of Use
            </a>
            and
            <a class="text-secondary hover:text-accent duration-300" href="/login">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      <!-- Signup Form - Submit/Continue Button -->
      <button
        type="submit"
        class="
					btn
					btn-secondary
					w-full
					max-w-2xl
					mt-8 mb-2
					hover:ring-2
					hover:ring-info
				"
        disabled={!trigger}
        >Create Account
      </button>
    </form>

    <!-- Signup Form - Link to Login -->
    <p class="text-center">
      Already have an account?
      <a class="text-secondary hover:text-info duration-300" href="/login"> Log in </a>
    </p>
  </div>
</div>

<h1 class="text-4xl font-bold">Authentication Testing</h1>

<div class="mt-4 grid grid-cols-2 gap-4">
  <div class="flex flex-col gap-4">
    <button class="btn btn-error w-full" on:click={() => signOut((error) => (apiError = error))}>
      Sign Out
    </button>
    <h2 class="text-2xl">Form Data</h2>
    <pre>Email Field   : {$form.email}</pre>
    <pre>Password Field: {$form.password}</pre>

    <h2 class="text-2xl">Auth Status</h2>
    <p class="text-red-600">
      If data below is <kbd class="kbd kbd-sm">null</kbd>, means there are no auth errors.
    </p>
    <pre>{JSON.stringify(apiError, null, 2)}</pre>

    <h2 class="text-2xl">Auth User Data</h2>
    <pre>{JSON.stringify($authStore, null, 2)}</pre>
  </div>
</div>
