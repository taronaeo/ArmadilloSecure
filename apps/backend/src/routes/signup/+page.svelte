<!-- JavaScript code -->
<script lang="ts">
	// import for forms
	import { createForm } from 'svelte-forms-lib';

	import { authStore, authStatusStore } from '$lib/stores';

	// import sign up function
	import { signUpEmailPassword } from '$lib/firebase/auth';

  //import yup for form validation
  import * as yup from 'yup';

	// JavaScript code for Continue button
	let confirm: boolean = false;

	// JavaScript code for Checkbox button
	let trigger = false;

	// Create a reference for the password
  const passwordRef = yup.ref('password');

	function toggleCheckbox() {
		trigger = !trigger;
	}

  // Yup validation code
  const { form, errors, state, handleChange, handleSubmit } = createForm({
      initialValues: {
        email: "",
        password: "",
        confirmPassword: ""
      },
      validationSchema: yup.object().shape({
        email: yup
          .string()
          .email()
          .required('Corporate Email is required.'),
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
				if ($form.password === $form.confirmPassword) {
					
					// This will only be executed if passwords match
					await signUpEmailPassword($form.email, $form.password);
					console.log('Account created successfully');
					} else {
					console.error('Passwords do not match');
				}
			}
    });

</script>

<svelte:head>
	<title>Sign Up</title>
</svelte:head>

<!-- Signup Form - Logo -->
<div class="skeleton w-32 h-32"></div>

<div class="flex flex-row items-center justify-center h-screen">
	<!-- Signup Form - Card -->
	<div class="w-full max-w-2xl p-10 border border-secondary rounded-md shadow-lg">
		<!-- Signup Form - Header -->
		<h1 class="text-3xl font-semibold text-center mb-5">Create your account</h1>

		<form on:submit|preventDefault={handleSubmit}>
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
						type="text"
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
						type="text"
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
						<a class="text-secondary hover:text-accent duration-300" href="/login"> Terms of Use </a>
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
				disabled={
					!trigger
				}

				>Create Account
				</button>
		</form>

		<!-- Signup Form - Link to Login -->
		<p class="text-center">
			Already have an account?
			<a class="text-secondary hover:text-accent duration-300" href="/login"> Log in </a>
		</p>
	</div>
</div>


<h1 class="text-4xl font-bold">Authentication Testing</h1>

<div class="mt-4 grid grid-cols-2 gap-4">
	<div class="flex flex-col gap-4">
		<h2 class="text-2xl">Form Data</h2>
		<pre>Email Field   : {$form.email}</pre>
		<pre>Password Field: {$form.password}</pre>

		<h2 class="text-2xl">Auth Status</h2>
		<p class="text-red-600">
			If data below is <kbd class="kbd kbd-sm">null</kbd>, means there are no auth errors.
		</p>
		<pre>{JSON.stringify($authStatusStore, null, 2)}</pre>

		<h2 class="text-2xl">Auth User Data</h2>
		<pre>{JSON.stringify($authStore, null, 2)}</pre>
	</div>
</div>
