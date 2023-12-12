<!-- JavaScript code -->
<script lang="ts">
	// import for forms
	import { createForm } from 'svelte-forms-lib';

	// JavaScript code for Continue button
	let confirm: boolean = false;

	// JavaScript code for Checkbox button
	let checkboxAcceptTerms = false;

	function toggleCheckbox() {
		checkboxAcceptTerms = !checkboxAcceptTerms;
	}
</script>

<svelte:head>
	<title>Sign Up</title>
</svelte:head>

<!-- Signup Form - Logo -->
<div class="skeleton w-32 h-32"></div>

<div class="flex flex-row items-center justify-center h-screen">
	<!-- Signup Form - Card -->
	<div class="w-full max-w-2xl p-10 border border-primary rounded-md shadow-lg">
		<!-- Signup Form - Header -->
		<h1 class="text-3xl font-semibold text-center mb-5">Create your account</h1>

		<form>
			<!-- Signup Form - Corporate Email Input -->
			<div>
				<label class="form-control w-full max-w-2xl">
					<div class="label">
						<span class="label-text">Corporate Email Address</span>
					</div>
					<input
						type="text"
						name="email"
						placeholder="Name@example.com"
						class="
							input input-bordered w-full max-w-2xl
              focus:ring-primary focus:border-primary duration-300 focus:outline-none"
					/>
				</label>
			</div>

			<!-- Signup Form - Password Input -->
			<div>
				<label class="form-control w-full max-w-2xl">
					<div class="label">
						<span class="label-text">Password</span>
					</div>
					<input
						type="text"
						name="pass"
						placeholder="••••••••"
						class="
							input input-bordered w-full max-w-2xl
              focus:ring-primary focus:border-primary duration-300 focus:outline-none"
					/>
				</label>
			</div>

			<!-- Signup Form - Confirm Password Input -->
			<div>
				<label class="form-control w-full max-w-2xl">
					<div class="label">
						<span class="label-text">Confirm Password</span>
					</div>
					<input
						type="text"
						name="confirmpass"
						placeholder="••••••••"
						class="
							input input-bordered w-full max-w-2xl
							focus:ring-primary focus:border-primary duration-300 focus:outline-none"
					/>
				</label>
			</div>

			<div class="form-control mt-7">
				<label class="label cursor-pointer">
					<input
						type="checkbox"
						class="checkbox checkbox-primary mr-5"
						bind:checked={checkboxAcceptTerms}
						on:click={toggleCheckbox}
					/>
					<span class="label-text">
						By signing up, you are creating a Armadillo account, and you agree to Armadillo's
						<a class="text-primary hover:text-accent duration-300" href="/login"> Terms of Use </a>
						and
						<a class="text-primary hover:text-accent duration-300" href="/login">
							Privacy Policy
						</a>
					</span>
				</label>
			</div>

			<!-- Signup Form - Submit/Continue Button -->
			{#if !confirm}
				<button
					type="submit"
					class="
						mt-8 mb-2 w-full max-w-2xl
						btn btn-primary focus:ring-2 focus:ring-success
					"
					on:click={() => {
						confirm = true;
					}}>Create Account</button
				>

				<!-- Signup Form - Submit/Continue Button with animation -->
			{:else}
				<button class="
					items-center justify-center
					w-full mt-5 mb-2 flex flex-col
					btn btn-primary">
					<span class="loading loading-spinner"></span>
				</button>
			{/if}
		</form>

		<!-- Signup Form - Link to Login -->
		<p class="text-center">
			Already have an account?
			<a class="text-primary hover:text-accent duration-300" href="/login"> Log in </a>
		</p>
	</div>
</div>
