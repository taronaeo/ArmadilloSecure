<!-- JavaScript code for Continue button -->
<script lang="ts">
  // import for forms
  import { createForm } from "svelte-forms-lib";
  
	let confirm: boolean = false;
</script>

<div class="flex items-center justify-center h-screen">

    <!-- Login Form - Card -->
    <div class="w-full max-w-lg p-10 border border-primary rounded-md shadow-lg">

        <!-- Login Form - Header -->
        <p class="text-3xl font-semibold text-center mb-5">
            Welcome Back
        </p>
        
        <!-- Login Form - Form Content -->
        <form>
            <!-- Form Content - Email Input -->
            <div>
                <label class="form-control w-full max-w-md">
                    <div class="label">
                        <span class="label-text">Email</span>
                    </div>
                    <input type="text" placeholder="Name@example.com" class="input input-bordered w-full max-w-md 
                    focus:ring-primary focus:border-primary duration-300 focus:outline-none" /> 
                </label>
            </div>

            <!-- Form Content - Password Input -->
            <div>
                <label class="form-control w-full max-w-md">
                    <div class="label">
                        <span class="label-text">Password</span>
                    </div>
                    <input type="text" placeholder="••••••••" class="input input-bordered w-full max-w-md 
                    focus:ring-primary focus:border-primary duration-300 focus:outline-none" /> 
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
    
        <!-- Login Form - Link to Sign up -->
        <p class="text-center">
            Don't have an account? 
            <a class="text-primary hover:text-accent duration-300" href="/signup">
                Sign up
            </a>
        </p>

    </div>

</div>