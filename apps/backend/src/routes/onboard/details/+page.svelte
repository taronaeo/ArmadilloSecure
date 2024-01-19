<!-- JavaScript code for Continue button -->
<script lang="ts">
  //No TS for now
</script>

<!-- Armadillo Logo-->
<div class="flex flex-row items-center justify-center p-10">
  <img src="/armadillo.png" alt="Armadillo Logo" />
</div>

<div class="flex flex-row items-center justify-center h-screen">
  <!-- Onboard Form - Card -->
  <div class="w-full max-w-2xl p-10 border border-secondary rounded-md shadow-lg">
    <!-- Onboard Form - Header -->
    <h1 class="text-3xl font-semibold text-center mb-5">Get Onboard</h1>

    <h2 class="text-center">Complete your profile to start using Armadillo!</h2>

    <form action="">
      <!-- Onboard Form - Name Input -->
      <div>
        <label for="fullname" class="form-control w-full max-w-xl">
          <span class="label-text">Full Name</span>
        </label>
        <input
          type="text"
          name="fullname"
          id="fullname"
          placeholder="John Doe"
          class="
              input input-bordered w-full max-w-xl
              focus:ring-secondary focus:border-secondary duration-300 focus:outline-none
            " />
      </div>

      <!-- Onboard Form - Corporate Domain Address Input -->
      <div>
        <label for="domainaddress" class="form-control w-full max-w-xl">
          <span class="label-text">Domain Address</span>
        </label>
        <input
          type="text"
          name="domainaddress"
          id="domainaddress"
          placeholder="nyp.edu.sg"
          class="
            input input-bordered w-full max-w-xl
					  focus:ring-secondary focus:border-secondary duration-300 focus:outline-none
          " />
      </div>

      <!-- Onboard Form - Submit/Continue Button -->
      <button
        type="submit"
        class="
          w-full max-w-xl mt-8 mb-2 btn btn-secondary
          hover:ring-2 hover:ring-info">
        Create Account
      </button>
    </form>

    <!-- Onboard Form - Link to Login -->
    <p class="text-center">
      Already have an account?
      <a class="text-secondary hover:text-info duration-300" href="/login"> Log in </a>
    </p>
  </div>
</div>
