<!-- JavaScript code -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let showInfoCard = false;

  // Function to show the info card
  const showDetails = (event: MouseEvent) => {
    // Prevent the event from propagating to the document listener
    event.stopPropagation();
    showInfoCard = true;
  };

  // Function to hide the info card
  const hideDetails = () => {
    showInfoCard = false;
  };

  // Script to create a Current Date object
  const currentDate = new Date();

  //Script to obtain current year
  const currentYear = currentDate.getFullYear().toString();

  //Script to obtian Previous year
  const previousYear = (currentDate.getFullYear() - 1).toString();

  // Use Svelte's onMount to attach event listeners after the component is mounted
  onMount(() => {
    // Add an event listener to the document to hide the info card when clicking outside of it
    document.addEventListener('click', () => {
      if (showInfoCard) {
        hideDetails();
      }
    });
  });
</script>

<!-- Landing Page - Card -->
<div class="flex flex-row items-center justify-center h-screen">
  <!-- Landing Page - Content -->
  <div
    class=" 
      w-full max-w-7xl h-screen p-10 rounded-md
      transition-transform duration-1000 ease-in-out">
    <!-- Landing Page - Header -->
    <div class="dropdown dropdown-bottom">
      <div
        tabindex="0"
        role="button"
        class="btn m-1 text-2xl font-semibold normal-case px-6 rounded-full border-none bg-transparent"
        >My Files
        <img src="dropdownarrow.svg" alt="error" />
      </div>
      <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
        <li>
          <a href="/">
            <img src="fileicon.svg" alt="error" />
            New Folder
          </a>
        </li>
        <hr />
        <li>
          <a href="/">
            <img src="fileicon.svg" alt="error" />
            File Upload
          </a>
        </li>
        <li>
          <a href="/">
            <img src="fileupload.svg" alt="error" />
            Folder Upload
          </a>
        </li>
      </ul>
    </div>

    <!-- Dropdown buttons for User -->
    <div>
      <!-- Type Dropdown -->
      <div class="dropdown dropdown-bottom">
        <div
          tabindex="0"
          role="button"
          class="btn m-1 font-semibold normal-case px-6 border-white hover:border-white"
          >Classification
          <span>
            <img src="dropdownarrow.svg" alt="error" />
          </span>
        </div>
        <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
          <li>
            <a href="/"> Open </a>
          </li>
          <hr />
          <li>
            <a href="/"> Confidential </a>
          </li>
          <hr />
          <li>
            <a href="/"> Secret </a>
          </li>
        </ul>
      </div>

      <!-- Type Dropdown -->
      <div class="dropdown dropdown-bottom">
        <div
          tabindex="0"
          role="button"
          class="btn m-1 font-semibold normal-case px-6 border-white hover:border-white"
          >Modified
          <span>
            <img src="dropdownarrow.svg" alt="error" />
          </span>
        </div>
        <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
          <li>
            <a href="/"> Today </a>
          </li>
          <li>
            <a href="/"> Last 7 Days </a>
          </li>
          <li>
            <a href="/"> Last 30 Days </a>
          </li>
          <li>
            <a href="/">
              This Year ({currentYear})
            </a>
          </li>
          <li>
            <a href="/">
              Last Year ({previousYear})
            </a>
          </li>
        </ul>
      </div>

      <!-- Clear All Button -->
      <button class="btn font-semibold normal-case px-6 rounded-full border-none bg-transparent">
        Clear all
      </button>
    </div>

    <div class="overflow-x-auto mt-5">
      <table class="w-full">
        <!-- Table Headers -->
        <thead>
          <tr class="border-b text-left py-2">
            <th class="py-3"> Name </th>
            <th class="py-3"> Owner </th>
            <th class="py-3"> Last Modified </th>
            <th class="py-3"> File Size </th>
            <th class="py-3"></th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody>
          <!-- row 1 -->
          <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
            <td class="py-3"> Nanyang Poly </td>
            <td class="py-3"> Dezidawk </td>
            <td class="py-3"> Dec 24, 2023 me </td>
            <td class="py-3"> 2 KB </td>
            <th class="text-center">
              <button on:click={showDetails} class="btn btn-ghost btn-xs hover:text-info">
                details
              </button>
            </th>
          </tr>
          <!-- row 2 -->
          <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
            <td class="py-3"> Dexter's School </td>
            <td class="py-3"> Dezidawk </td>
            <td class="py-3"> Aug 26, 2023 me </td>
            <td class="py-3"> 111 KB </td>
            <th class="text-center py-3">
              <button on:click={showDetails} class="btn btn-ghost btn-xs hover:text-info">
                details
              </button>
            </th>
          </tr>
          <!-- row 3 -->
          <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
            <td class="py-3"> Dr Receipts Pitch </td>
            <td class="py-3"> Dezidawk </td>
            <td class="py-3">Jan 20, 2022 me </td>
            <td class="py-3"> 4 KB </td>
            <th class="text-center py-3">
              <button on:click={showDetails} class="btn btn-ghost btn-xs hover:text-info">
                details
              </button>
            </th>
          </tr>
          <!-- row 4 -->
          <tr class="hover:bg-zinc-900 duration-80 border-b text-left py-2">
            <td class="py-3"> Infoseceurity Project </td>
            <td class="py-3"> Dezidawk </td>
            <td class="py-3"> April 5, 2023 me </td>
            <td class="py-3"> 15 KB </td>
            <th class="text-center py-3">
              <button on:click={showDetails} class="btn btn-ghost btn-xs hover:text-info">
                details
              </button>
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Info Card -->
  {#if showInfoCard}
    <div
      in:fade={{ duration: 300 }}
      out:fade={{ duration: 300 }}
      class="w-96 max-w-7xl h-screen p-5 rounded-md border border-white">
      <div class="flex items-center pb-2">
        <h1 class="flex-grow font-semibold">Example File Name.pdf</h1>
        <button
          on:click={hideDetails}
          class="btn font-semibold normal-case rounded-full border-none bg-transparent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <hr />
      <div class="pt-5">
        <h2 class="pb-2 font-semibold">File Details</h2>

        <!-- File Type Section -->
        <div class="py-2">
          <p>Type</p>
          <p class="text-info">PowerPoint</p>
        </div>

        <!-- File Size Section -->
        <div class="py-2">
          <p>Size</p>
          <p class="text-info">57.3MB</p>
        </div>

        <!-- File Description Section -->
        <div class="py-2">
          <p class="pb-1">Description</p>
          <input
            type="text"
            placeholder="Add Description"
            class="
              input input-bordered input-info w-full max-w-xs
              focus:ring-info focus:border-info focus:outline-none" />
        </div>

        <!-- Delete Button -->
        <div class="py-4">
          <button class="btn btn-outline btn-error px-8">Delete</button>
        </div>
      </div>
    </div>
  {/if}
</div>
