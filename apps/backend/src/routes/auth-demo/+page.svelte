<script lang="ts">
	import { authStore, authStatusStore } from '$lib/stores';
	import { signOut, signInEmailPassword, signUpEmailPassword } from '$lib/firebase/auth';

	let email: string;
	let password: string;
</script>

<h1 class="text-4xl font-bold">Authentication Testing</h1>

<div class="mt-4 grid grid-cols-2 gap-4">
	<div class="flex flex-col gap-4">
		<h2 class="text-2xl">Form Data</h2>
		<pre>Email Field   : {email}</pre>
		<pre>Password Field: {password}</pre>

		<h2 class="text-2xl">Auth Status</h2>
		<p class="text-red-600">
			If data below is <kbd class="kbd kbd-sm">null</kbd>, means there are no auth errors.
		</p>
		<pre>{JSON.stringify($authStatusStore, null, 2)}</pre>

		<h2 class="text-2xl">Auth User Data</h2>
		<pre>{JSON.stringify($authStore, null, 2)}</pre>
	</div>

	<div class="flex flex-col gap-4">
		<h2 class="text-2xl">Login / Sign Up</h2>

		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Email Address</span>
				<span class="text-red-600 label-text-alt">*</span>
			</div>
			<input
				type="text"
				placeholder="john@example.com"
				bind:value={email}
				class="input input-bordered w-full" />
		</label>

		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Password</span>
				<span class="text-red-600 label-text-alt">*</span>
			</div>
			<input
				type="password"
				placeholder="******"
				bind:value={password}
				class="input input-bordered w-full" />
		</label>

		<button class="btn btn-neutral w-full" on:click={() => signInEmailPassword(email, password)}>
			Login
		</button>

		<button class="btn btn-neutral w-full" on:click={() => signUpEmailPassword(email, password)}>
			Sign Up
		</button>

		<button class="btn btn-error w-full" on:click={() => signOut()}>Sign Out</button>
	</div>
</div>
