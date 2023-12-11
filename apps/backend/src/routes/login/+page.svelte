<!-- JavaScript code -->
<script lang="ts">
	// import for forms
	import { createForm } from 'svelte-forms-lib';

	import { authStore, authStatusStore } from '$lib/stores';

	// import sign up function
	import { signOut, signInEmailPassword } from '$lib/firebase/auth';

  //import yup for form validation
  import * as yup from 'yup';

	let confirm: boolean = false;

	// Yup validation code
  const { form, errors, state, handleChange, handleSubmit } = createForm({
      initialValues: {
        email: "",
        password: ""
      },
      validationSchema: yup.object().shape({
        email: yup
          .string()
          .email()
          .required('Please enter a valid Email.'),
        password: yup
          .string()
          .required('Please enter a valid Password.'),
      }),
      // onSubmit: async (data) => {
			// 	if () {
					
			// 		// This will only be executed if the conditions meet
			// 		await signInEmailPassword($form.email, $form.password);
			// 		console.log('Account Login successfully');
			// 		} else {
			// 		console.error('Incorrect email/password, Please try again.');
			// 	}
			// }
			onSubmit: (data) => {
				signInEmailPassword($form.email, $form.password);
			}
	});
</script>

<div class="flex items-center justify-center h-screen">
	<!-- Login Form - Card -->
	<div class="w-full max-w-lg p-10 border border-secondary rounded-md shadow-lg">
		<!-- Login Form - Header -->
		<p class="text-3xl font-semibold text-center mb-5">Welcome Back</p>

		<!-- Login Form - Form Content -->
		<form on:submit|preventDefault={handleSubmit}>
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
							input 
							input-bordered 
							w-full 
							max-w-md 
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
							input 
							input-bordered 
							w-full 
							max-w-md
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

			<!-- Form Content - Submit/Continue Button -->
				<button
					type="submit"
					class="btn 
					btn-secondary 
					w-full 
					max-w-2xl 
					mt-8 
					mb-2 
					hover:ring-2 
					hover:ring-info"
					>Continue
				</button>
		</form>

		<!-- Login Form - Link to Sign up -->
		<p class="text-center">
			Don't have an account?
			<a class="text-secondary hover:text-info duration-300" href="/signup"> Sign up </a>
		</p>
	</div>
</div>

<h1 class="text-4xl font-bold">Authentication Testing</h1>

<div class="mt-4 grid grid-cols-2 gap-4">
	<div class="flex flex-col gap-4">
		<button class="btn btn-error w-full" on:click={() => signOut()}>Sign Out</button>
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