<!-- JavaScript code -->
<script lang="ts">
  // Imports
  import { createForm } from 'svelte-forms-lib';
  import type { FirebaseError } from 'firebase/app';
  import { signUpEmailPassword } from '$lib/firebase/auth';
  import * as yup from 'yup';

  // State variable
  let apiError: FirebaseError | null;
  let checkLoading = false;

  // Password reference for validation
  const passwordRef = yup.ref('password');

  // Form + Yup validation
  const { form, errors, handleChange, handleSubmit } = createForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      tosCheckbox: false,
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
      tosCheckbox: yup
        .boolean()
        .required('Please agree to the terms of service and privacy policy.'),
    }),
    onSubmit: async (data) => {
      if (data.password !== data.confirmPassword) {
        console.error('Passwords do not match');
        return;
      }
      checkLoading = true;

      await signUpEmailPassword(data.email, data.password, (error) => (apiError = error));

      checkLoading = false;
    },
  });
</script>

<svelte:head>
  <title>Sign Up</title>
</svelte:head>

<!-- Armadillo Logo-->
<div class="flex flex-row items-center justify-center p-10">
  <img src="../armadillo.png" alt="Armadillo Logo" />
</div>

<div class="flex flex-row items-center justify-center pb-20">
  <!-- Signup Form - Card -->
  <div class="w-full max-w-2xl p-10 border border-secondary rounded-md shadow-lg">
    <!-- Signup Form - Header -->
    <h1 class="text-3xl font-semibold text-center mb-5">Create your account</h1>

    <form on:submit|preventDefault={handleSubmit}>
      <!-- General Error Message for already registered emails -->
      {#if apiError && apiError.code === 'auth/email-already-in-use'}
        <div class="p-4 flex flex-row bg-red-50 text-red-800 rounded-lg" role="alert">
          <img src="/errorlogo.svg" alt="Error Icon" />
          <div class="ml-2 text-sm font-medium">
            Email is already registered, Please use a different Email.
          </div>
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
              w-full max-w-2xl input input-bordered
              focus:ring-secondary focus:border-secondary duration-300 focus:outline-none
            " />
        </label>
        <div>
          <span class="text-red-600">{$errors.email}</span>
        </div>
        <div>
          <span class="text-red-600">{$errors.tosCheckbox}</span>
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
              w-full max-w-2xl input input-bordered
              focus:ring-secondary focus:border-secondary duration-300 focus:outline-none
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
            name="confirmPassword"
            placeholder="••••••••"
            on:change={handleChange}
            bind:value={$form.confirmPassword}
            class="
              input input-bordered w-full max-w-2xl
              focus:ring-secondary focus:border-secondary duration-300 focus:outline-none
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
            bind:checked={$form.tosCheckbox}
            on:change={handleChange} />
          <span class="label-text">
            By signing up, you are creating a Armadillo account, and you agree to Armadillo's
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
          w-full max-w-2xl mt-8 mb-2 btn btn-secondary
					hover:ring-2 hover:ring-info"
        disabled={!$form.tosCheckbox}>
        <span>
          {#if checkLoading}
            <span class="loading loading-spinner"></span>
          {:else}
            Create Account
          {/if}
        </span>
      </button>
    </form>

    <!-- Signup Form - Link to Login -->
    <p class="text-center">
      Already have an account?
      <a class="text-secondary hover:text-info duration-300" href="/authentication/login">
        Log in
      </a>
    </p>
  </div>
</div>
