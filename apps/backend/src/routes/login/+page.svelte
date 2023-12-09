<!-- JavaScript code for Continue button -->
<script lang="ts">
	// import for forms
	import { createForm } from 'svelte-forms-lib';

	let confirm: boolean = false;
</script>

<div class="flex items-center justify-center h-screen">
	<!-- Login Form - Card -->
	<div class="w-full max-w-lg p-10 border border-primary rounded-md shadow-lg">
		<!-- Login Form - Header -->
		<p class="text-3xl font-semibold text-center mb-5">Welcome Back</p>

		<!-- Login Form - Form Content -->
		<form>
			<!-- Form Content - Email Input -->
			<div>
				<label class="form-control w-full max-w-md">
					<div class="label">
						<span class="label-text">Email</span>
					</div>
					<input
						type="text"
						name="email"
						placeholder="Name@example.com"
						class="input input-bordered w-full max-w-md
                    focus:ring-primary focus:border-primary duration-300 focus:outline-none"
					/>
				</label>
			</div>

			<!-- Form Content - Password Input -->
			<div>
				<label class="form-control w-full max-w-md">
					<div class="label">
						<span class="label-text">Password</span>
					</div>
					<input
						type="text"
						name="pass"
						placeholder="••••••••"
						class="input input-bordered w-full max-w-md
                    focus:ring-primary focus:border-primary duration-300 focus:outline-none"
					/>
				</label>
			</div>

			<!-- Form Content - Submit/Continue Button -->
			{#if !confirm}
				<button
					type="submit"
					class="btn btn-primary w-full max-w-2xl mt-8 mb-2 focus:ring-2 focus:ring-success"
					on:click={() => {
						confirm = true;
					}}>Continue</button
				>

				<!-- Form Content - Submit/Continue Button with animation -->
			{:else}
				<button class="btn btn-primary w-full mt-5 mb-2 flex flex-col items-center justify-center">
					<span class="loading loading-spinner"></span>
				</button>
			{/if}
		</form>

		<!-- Login Form - Link to Sign up -->
		<p class="text-center">
			Don't have an account?
			<a class="text-primary hover:text-accent duration-300" href="/signup"> Sign up </a>
		</p>
	</div>
</div>
