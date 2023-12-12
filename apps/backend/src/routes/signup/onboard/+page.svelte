<!-- JavaScript code for Continue button -->
<script lang="ts">
	let confirm: boolean = false;
</script>

<!-- Onboard Form - Logo -->
<div class="skeleton w-32 h-32"></div>

<div class="flex flex-row items-center justify-center h-screen">
	<!-- Onboard Form - Card -->
	<div class="w-full max-w-2xl p-10 border border-primary rounded-md shadow-lg">
		<!-- Onboard Form - Header -->
		<h1 class="text-3xl font-semibold text-center mb-5">Get Onboard</h1>

		<span class="text-center">Complete your profile to start using Armadillo!</span>

		<form action="">
			<!-- Onboard Form - Name Input -->
			<div>
				<label class="form-control w-full max-w-xl">
					<div class="label">
						<span class="label-text">Full Name</span>
					</div>
					<input
						type="text"
						name="fullname"
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
						name="domainaddress"
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
						name="headshot"
						accept="image/png, image/jpeg"
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
					<span class="loading loading-spinner"></span>
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
