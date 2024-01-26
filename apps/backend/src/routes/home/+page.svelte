<!-- JavaScript code -->
<script lang="ts">
  // import for fade feature
  import { fade } from 'svelte/transition';

  // import for FireStore Database Stuff
  import { firestore } from '$lib/firebase';
  import { doc, getDoc } from 'firebase/firestore';
  import { authStore } from '$lib/stores';

  // State variables
  let showInfoCard = false;
  let selfDestructModal: HTMLDialogElement;
  let fileAccessModal: HTMLDialogElement;

  // Reactive Declarations
  $: fullName = $authStore?.full_name;
  $: profilePicUrl = `https://ui-avatars.com/api/?name=${fullName}&format=svg&rounded=true`;

  // Modal functions
  function showSelfDestructModal() {
    selfDestructModal.showModal();
  }

  function showfileAccessModal() {
    fileAccessModal.showModal();
  }

  // Handle details card
  const showDetails = (event: MouseEvent) => {
    event.stopPropagation();
    showInfoCard = true;
  };

  const hideDetails = () => {
    showInfoCard = false;
  };

  // Display date information
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const previousYear = (currentDate.getFullYear() - 1).toString();
</script>

<!-- Landing Page - Card -->
<div class="flex flex-row items-center justify-center h-screen">
  <!-- Landing Page - Content -->
  <div
    class=" 
      w-full max-w-7xl h-screen p-10 rounded-md
      transition-transform duration-1000 ease-in-out">
    <!-- Landing Page - Header -->
    <!-- User Details -->

    {#if fullName}
      <div class="flex justify-end items-center">
        <img class="rounded w-9 mr-3" alt="Full Name" src={profilePicUrl} />
        <div class="">{fullName}</div>
      </div>
    {/if}

    <div class="dropdown dropdown-bottom">
      <div
        tabindex="0"
        role="button"
        class="btn m-1 text-2xl font-semibold normal-case px-6 rounded-full border-none bg-transparent">
        My Files
        <img src="dropdownarrow.svg" alt="Dropdown Arrow" />
      </div>
      <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
        <li>
          <a href="/">
            <img src="fileicon.svg" alt="File Icon" />
            New Folder
          </a>
        </li>
        <hr />
        <li>
          <a href="/">
            <img src="fileicon.svg" alt="File Icon" />
            File Upload
          </a>
        </li>
        <li>
          <a href="/">
            <img src="fileupload.svg" alt="File Icon" />
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
          class="btn m-1 font-semibold normal-case px-6 border-white hover:border-white">
          Classification
          <span>
            <img src="dropdownarrow.svg" alt="Drop Down Arrow" />
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
          class="btn m-1 font-semibold normal-case px-6 border-white hover:border-white">
          Modified
          <span>
            <img src="dropdownarrow.svg" alt="Dropdown Arrow" />
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
          <tr class="py-2 border-b text-left duration-80 hover:bg-zinc-900">
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
          <tr class="py-2 border-b text-left hover:bg-zinc-900 duration-80">
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
          <tr class="py-2 border-b text-left hover:bg-zinc-900 duration-80">
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
          <tr class="py-2 border-b text-left hover:bg-zinc-900 duration-80">
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

        <!-- File Access Section -->
        <div class="py-2">
          <button
            class="btn btn-outline btn-info rounded-full font-semibold normal-case px-6"
            on:click={showfileAccessModal}>
            Manage Access
          </button>
          <dialog bind:this={fileAccessModal} class="modal modal-bottom sm:modal-middle">
            <div class="modal-box">
              <h3 class="font-bold text-lg pb-2">Share Examplefile.ppt</h3>
              <input
                type="text"
                placeholder="Add People"
                class="
                  input input-bordered input-info w-full text-sm
                  focus:ring-info focus:border-info focus:outline-none" />
              <p class="py-4 font-semibold">People with Access</p>

              <!-- Users with Access -->
              {#if $authStore?.full_name}
                <div class="flex items-center py-2">
                  <img class="rounded w-9 mr-3" alt="User Profile Circle" src={profilePicUrl} />
                  <div class="flex flex-col">
                    <div class="font-bold">{$authStore?.full_name} (You)</div>
                    <div class="text-sm">{$authStore.email}</div>
                  </div>
                </div>
              {:else}
                <span class="text-error">Loading user data...</span>
              {/if}

              <div class="modal-action flex justify-between">
                <!-- Copy Link Button -->
                <div class="flex flex-row justify-start">
                  <button
                    class="
                      btn btn-outline btn-info rounded-full
                      font-semibold normal-case px-6 flex items-center">
                    <img src="linkIcon.svg" alt="Link Icon" />
                    Copy Link
                  </button>
                </div>

                <form method="dialog">
                  <!-- if there is a button in form, it will close the modal -->
                  <button class="btn">Done</button>
                </form>
              </div>
            </div>
          </dialog>
        </div>

        <!-- File Type Section -->
        <div class="py-2 text-sm">
          <p>Type</p>
          <p class="text-info">PowerPoint</p>
        </div>

        <!-- File Size Section -->
        <div class="py-2 text-sm">
          <p>Size</p>
          <p class="text-info">57.3MB</p>
        </div>

        <!-- Manual Self Destruct Button -->
        <div class="pt-4">
          <div class="py-2">
            <button class="py-4 w-full btn" on:click={showSelfDestructModal}>
              SELF-DESTRUCT
            </button>
            <dialog bind:this={selfDestructModal} class="modal modal-bottom sm:modal-middle">
              <div class="modal-box">
                <h3 class="font-bold text-lg">Warning</h3>
                <p class="py-4">
                  This will
                  <span class="text-error"> destroy all active instances of this file </span>
                  , are you sure?
                </p>
                <button class="btn btn-outline btn-error px-8"> Self-Destruct </button>
                <div class="modal-action">
                  <form method="dialog">
                    <!-- if there is a button in form, it will close the modal -->
                    <button class="btn">Close</button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>

          <!-- Delete Button -->
          <div class="py-2">
            <button
              class="
              w-full px-8
              btn btn-outline btn-error">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
