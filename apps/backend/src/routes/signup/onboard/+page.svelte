<!-- JavaScript code for Continue button -->
<script lang="ts">
	let confirm: boolean = false;
</script>

<div class="flex items-center justify-center h-screen">
	<!-- Onboard Form - Logo -->

	<!-- Onboard Form - Card -->
	<div class="w-full max-w-2xl p-10 border border-primary rounded-md shadow-lg">

		<!-- Onboard Form - Header -->
		<h1 class="text-3xl font-semibold text-center mb-5">Get Onboard</h1>
		
		<h2 class="text-center">Complete your profile to start using Armadillo!</h2>

		<form action="">
			<!-- Onboard Form - Name Input -->
			<div>
				<label class="form-control w-full max-w-xl">
					<div class="label">
						<span class="label-text">Full Name</span>
					</div>
					<input
						type="text"
						placeholder="John Doe"
						class="input input-bordered w-full max-w-xl
					focus:ring-primary focus:border-primary duration-300 focus:outline-none"
					/>
				</label>
			</div>

			<!-- Onboard Form - Corporate Domain Address Input -->
			<div>
				<label class="form-control w-full max-w-xl">
					<div class="label">
						<span class="label-text">Domain Address</span>
					</div>
					<input
						type="text"
						placeholder="nyp.edu.sg"
						class="input input-bordered w-full max-w-xl
					focus:ring-primary focus:border-primary duration-300 focus:outline-none"
					/>
				</label>
			</div>

			<!-- Onboard Form - Headshot Photo Input -->
			<div>
				<label class="form-control w-full max-w-xl">
					<div class="label">
						<span class="label-text">Headshot Photo (.png/.jpg)</span>
					</div>
					<input
						type="file"
						class="file-input file-input-bordered file-input-primary w-full max-w-xl"
					/>
				</label>
			</div>

			<!-- Onboard Form - Submit/Continue Button -->
			{#if !confirm}
				<button
					type="submit"
					class="btn btn-primary w-full max-w-xl mt-8 mb-2 focus:ring-2 focus:ring-success"
					on:click={() => {
						confirm = true;
					}}>Create Account</button
				>

				<!-- <button type="submit" id="continueButton" class="btn btn-primary w-80 mt-8 mb-2 focus:ring-2 focus:ring-success" on:click={startLoading}>Continue</button> -->

			<!-- Onboard Form - Submit/Continue Button with animation -->
			{:else}
				<button class="btn btn-primary w-full mt-5 mb-2 flex flex-col items-center justify-center">
					<svg
						class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				</button>
			{/if}
		</form>

		<!-- Onboard Form - Link to Login -->
		<p class="text-center">
			Already have an account?
			<a class="text-primary hover:text-accent duration-300" href="/login"> Log in </a>
		</p>
	</div>
</div>
