<!-- JavaScript code -->
<script lang="ts">
  // Imports
  import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
  import type { FirebaseError } from 'firebase/app';
  import type { FSUser, FSDomain } from '@armadillo/shared';
  import { createForm } from 'svelte-forms-lib';
  import { signOut } from '$lib/firebase/auth';
  import { firestore } from '$lib/firebase';
  import { domainStore, authStore } from '$lib/stores';
  import { fade } from 'svelte/transition';
  import * as yup from 'yup';

  // State variables
  let showInfoCard = false;
  let selfDestructModal: HTMLDialogElement;
  let fileAccessModal: HTMLDialogElement;
  let logoutModal: HTMLDialogElement;
  let settingsModal: HTMLDialogElement;
  let apiError: FirebaseError | null;

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

  function showlogoutModal() {
    logoutModal.showModal();
  }

  function showsettingsModal() {
    settingsModal.showModal();
  }

  // Handle details card
  const showDetails = (event: MouseEvent) => {
    event.stopPropagation();
    showInfoCard = true;
  };

  const hideDetails = () => {
    showInfoCard = false;
  };

  const domainAdd = $authStore?.email.split('@')[1];

  // Display date information
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const previousYear = (currentDate.getFullYear() - 1).toString();

  // Form + Yup validation
  const { form, errors, handleChange, handleSubmit } = createForm({
    initialValues: {
      domain_dns_suffix: $domainStore?.domain_dns_suffix,
      domain_ipv4_start: $domainStore?.domain_ipv4_start,
      domain_ipv4_end: $domainStore?.domain_ipv4_end,
      domain_administrators: $domainStore?.domain_administrators,
    },
    validationSchema: yup.object().shape({
      domain_dns_suffix: yup.string().required('dns suffix is a required field'),
      domain_ipv4_start: yup.string().required('ipv4 end is a required field'),
      domain_ipv4_end: yup.string().required('ipv4 start is a required field'),
    }),

    // On submit, if the user isn't logged in, do not continue the process, else populate the data and determine onboard true
    onSubmit: async (data) => {
      if (!$authStore) return;
      if (!data.domain_dns_suffix) return;
      if (!data.domain_ipv4_start) return;
      if (!data.domain_ipv4_end) return;

      const uid = $authStore.uid;

      const userDocRef = doc(firestore, 'domains', domainAdd);

      const domain: Omit<FSDomain, 'domain_administrators' | 'created_at'> = {
        domain_dns_suffix: data.domain_dns_suffix,
        domain_ipv4_start: data.domain_ipv4_start,
        domain_ipv4_end: data.domain_ipv4_end,
        updated_at: serverTimestamp(),
      };

      await setDoc(userDocRef, domain, {
        merge: true,
      }).catch((error) => {
        apiError = error;
      });
    },
  });
</script>

<!-- Landing Page - Card -->
<div
  class="
  flex flex-row items-center justify-center h-screen
  font-semibold normal-case">
  <!-- Landing Page - Content -->
  <div
    class=" 
      w-full max-w-7xl h-screen p-10 rounded-md
      transition-transform duration-1000 ease-in-out">
    <!-- Landing Page - Header -->
    <div class="justify-between flex flex-row">
      <!-- My Files Drop Down -->
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
            <a href="/home">
              <img src="fileicon.svg" alt="File Icon" />
              New Folder
            </a>
          </li>
          <hr />
          <li>
            <a href="/home">
              <img src="fileicon.svg" alt="File Icon" />
              File Upload
            </a>
          </li>
          <li>
            <a href="/home">
              <img src="fileupload.svg" alt="File Icon" />
              Folder Upload
            </a>
          </li>
        </ul>
      </div>

      <!-- User Details -->
      <div class="">
        <div class=" dropdown dropdown-bottom">
          <div
            tabindex="0"
            role="button"
            class="btn m-1 w-55 px-6 normal-case rounded-full border-none bg-transparent">
            {#if fullName}
              <div class="flex justify-end items-center">
                <img class="rounded w-9 mr-3" alt="Full Name" src={profilePicUrl} />
                <div class="">{fullName}</div>
              </div>
            {/if}
          </div>
          <ul
            class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
            <li class="flex flex-row justify-center">
              <!-- Settings Modal -->
              <button on:click={showsettingsModal} class="w-full">
                <img src="settings.svg" alt="Setting Icon" />
                Settings
              </button>
              <dialog bind:this={settingsModal} class="modal flex justify-center">
                <div class="modal-box h-screen max-w-2xl">
                  <form method="dialog">
                    <button
                      class="
                        btn btn-sm btn-circle
                        btn-ghost absolute right-2 top-2">
                      ✕
                    </button>
                  </form>
                  <h1 class="p-2 font-bold text-2xl">User Settings</h1>
                  <hr />

                  <!-- User Details Section-->
                  <div>
                    <h3 class="py-2 text-lg">User Details</h3>
                    {#if $authStore?.full_name}
                      <div class="flex items-center pt-2 pb-7">
                        <img
                          class="rounded w-15 mr-4"
                          alt="User Profile Circle"
                          src={profilePicUrl} />
                        <div class="flex flex-col">
                          <div class="font-bold text-lg">{$authStore?.full_name}</div>
                          <div class="text-sm">Standard User</div>
                        </div>
                      </div>
                    {:else}
                      <span class="text-error">Loading user data...</span>
                    {/if}

                    <!-- User's Full Name -->
                    <div class="pb-2">
                      <div class="label">
                        <span class="label-text">Full Name</span>
                      </div>
                      <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={$authStore?.full_name}
                        placeholder={$authStore?.full_name}
                        class="
                          w-full input input-bordered duration-300
                          focus:ring-secondary focus:border-secondary focus:outline-none
                        " />
                    </div>

                    <!-- User's Email -->
                    <div class="pb-2">
                      <div class="label">
                        <span class="label-text">Email</span>
                      </div>
                      <input
                        disabled
                        id="email"
                        type="text"
                        name="email"
                        value={$authStore?.email}
                        placeholder={$authStore?.email}
                        class="
                          w-full input input-bordered duration-300
                          focus:ring-secondary focus:border-secondary focus:outline-none
                        " />
                    </div>
                    <div class="flex justify-end">
                      <button
                        type="submit"
                        class="
                        w-24 mt-8 mb-2 btn btn-secondary
                        hover:ring-2 hover:ring-info">
                        Save
                      </button>
                    </div>
                  </div>

                  <!-- User Domain Information Section -->
                  {#if $domainStore?.domain_administrators == $authStore?.uid}
                    <form on:submit|preventDefault={handleSubmit}>
                      <label for="DomainInfo" class="form-control">
                        <div class="label">
                          <span class="label-text py-2 text-lg">User Domain Information</span>
                        </div>
                        <div>
                          <!-- User's Domain Address -->
                          <div class="pb-2">
                            <div class="label">
                              <span class="label-text">Domain Address</span>
                            </div>
                            <input
                              disabled
                              id="domainAdd"
                              type="text"
                              name="domainAdd"
                              value={$authStore?.email.split('@')[1]}
                              placeholder="Domain Address"
                              class="
                              w-full input input-bordered duration-300
                              focus:ring-secondary focus:border-secondary focus:outline-none
                            " />
                          </div>

                          <!-- User's Dns Suffix  -->
                          <div class="pb-2">
                            <div class="label">
                              <span class="label-text">DNS Suffix</span>
                            </div>

                            <input
                              id="domain_dns_suffix"
                              type="text"
                              name="domain_dns_suffix"
                              on:change={handleChange}
                              bind:value={$form.domain_dns_suffix}
                              placeholder="Enter DNS Suffix"
                              class="
                              w-full input input-bordered duration-300
                              focus:ring-secondary focus:border-secondary focus:outline-none
                            " />
                            <div class="label text-info text-xs">
                              <div>
                                <span class="text-red-600">{$errors.domain_dns_suffix}</span>
                              </div>
                              <span class="help-block">
                                DNS suffix can be found from the Active Directory Server
                              </span>
                            </div>
                          </div>

                          <!-- User's IPv4 Start  -->
                          <div class="pb-2">
                            <div class="label">
                              <span class="label-text">IPv4 Start</span>
                            </div>
                            <input
                              id="domain_ipv4_start"
                              type="text"
                              name="domain_ipv4_start"
                              on:change={handleChange}
                              bind:value={$form.domain_ipv4_start}
                              placeholder="Enter IP Address"
                              class="
                              w-full input input-bordered duration-300
                              focus:ring-secondary focus:border-secondary focus:outline-none
                            " />
                          </div>
                          <div class="label text-xs">
                            <span class="text-red-600">{$errors.domain_ipv4_start}</span>
                          </div>

                          <!-- User's IPv4 End  -->
                          <div class="pb-2">
                            <div class="label">
                              <span class="label-text">IPv4 End</span>
                            </div>
                            <input
                              id="domain_ipv4_end"
                              type="text"
                              name="domain_ipv4_end"
                              on:change={handleChange}
                              bind:value={$form.domain_ipv4_end}
                              placeholder="Enter IP Address"
                              class="
                              w-full input input-bordered duration-300
                              focus:ring-secondary focus:border-secondary focus:outline-none
                            " />
                          </div>
                          <div class="label text-xs">
                            <span class="text-red-600">{$errors.domain_ipv4_end}</span>
                          </div>

                          <!-- Domain Admin -->
                          <div class="pb-2">
                            <div class="label">
                              <span class="label-text">Domain Admin</span>
                            </div>
                            <input
                              disabled
                              id="domain_admin"
                              type="text"
                              name="domain_admin"
                              on:change={handleChange}
                              bind:value={$form.domain_administrators}
                              placeholder="User UID"
                              class="
                              w-full input input-bordered duration-300
                              focus:ring-secondary focus:border-secondary focus:outline-none
                            " />
                          </div>
                        </div>

                        <!-- For this button, only enable for accounts that are administrators -->
                        <div class="flex justify-end">
                          <button
                            type="submit"
                            class="
                          w-24 mt-8 mb-2 btn btn-secondary
                          hover:ring-2 hover:ring-info">
                            Save
                          </button>
                        </div>
                      </label>
                    </form>
                  {/if}
                  <!-- User Password Change -->
                  <div>
                    <h3 class="py-2 text-lg">Change Password</h3>
                    <div>
                      <!-- User's Original Password -->
                      <div class="pb-2">
                        <div class="label">
                          <span class="label-text">Old Password</span>
                        </div>
                        <input
                          id="password"
                          type="password"
                          name="password"
                          placeholder="••••••••"
                          class="
                            w-full input input-bordered duration-300
                            focus:ring-secondary focus:border-secondary focus:outline-none
                          " />
                      </div>

                      <!-- User's New Password -->
                      <div class="pb-2">
                        <div class="label">
                          <span class="label-text">New Password</span>
                        </div>
                        <input
                          id="password"
                          type="password"
                          name="password"
                          placeholder="••••••••"
                          class="
                            w-full input input-bordered duration-300
                            focus:ring-secondary focus:border-secondary focus:outline-none
                          " />
                      </div>

                      <!-- User's New Confirm Password-->
                      <div class="pb-2">
                        <div class="label">
                          <span class="label-text">Confirm Password</span>
                        </div>
                        <input
                          id="password"
                          type="password"
                          name="password"
                          placeholder="••••••••"
                          class="
                            w-full input input-bordered duration-300
                            focus:ring-secondary focus:border-secondary focus:outline-none
                          " />
                      </div>

                      <!-- For this button, only enable for accounts that are administrators -->

                      <div class="flex justify-end">
                        <button
                          type="submit"
                          class="
                            w-24 mt-8 mb-2 btn btn-secondary
                            hover:ring-2 hover:ring-info">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </dialog>
            </li>
            <hr />
            <li class="flex flex-row justify-center">
              <!-- Logout Modal -->
              <button on:click={showlogoutModal} class="w-full hover:bg-red-500">
                <img src="logout.svg" alt="File Icon" />
                Logout
              </button>
              <dialog
                bind:this={logoutModal}
                class="
                  flex justify-center
                  modal modal-bottom sm:modal-middle">
                <div class="modal-box">
                  <form method="dialog">
                    <button
                      class="
                        btn btn-sm btn-circle
                        btn-ghost absolute right-2 top-2">
                      ✕
                    </button>
                  </form>
                  <h3 class="font-bold text-2xl text-error">Warning</h3>
                  <p class="py-4 text-lg">
                    Are you sure you want to <span class="text-error"> Logout </span> ?
                  </p>
                  <div class="modal-action">
                    <button
                      class="btn btn-outline btn-error px-8"
                      on:click={() => signOut((error) => (apiError = error))}>
                      Confirm
                    </button>
                  </div>
                </div>
              </dialog>
            </li>
          </ul>
        </div>
      </div>
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
            <a href="/home"> Open </a>
          </li>
          <hr />
          <li>
            <a href="/home"> Confidential </a>
          </li>
          <hr />
          <li>
            <a href="/home"> Secret </a>
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
            <a href="/home"> Today </a>
          </li>
          <li>
            <a href="/home"> Last 7 Days </a>
          </li>
          <li>
            <a href="/home"> Last 30 Days </a>
          </li>
          <li>
            <a href="/home">
              This Year ({currentYear})
            </a>
          </li>
          <li>
            <a href="/home">
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
            <th class="py-3"> Classification </th>
            <th class="py-3"> Date Uploaded </th>
            <th class="py-3"> File Size </th>
            <th class="py-3"></th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody>
          <!-- row 1 -->
          <tr class="py-2 border-b text-left duration-80 hover:bg-zinc-900">
            <td class="py-3"> Nanyang Poly </td>
            <td class="py-3 text-success"> Open </td>
            <td class="py-3"> Dec 24, 2023 </td>
            <td class="py-3"> 2 KB </td>
            <th class="text-center">
              <button on:click={showDetails} class="btn btn-ghost btn-xs hover:text-info">
                details
              </button>
            </th>
          </tr>
          <!-- row 2 -->
          <tr class="py-2 border-b text-left hover:bg-zinc-900 duration-80">
            <td class="py-3"> Dexter's Super Secret Porn </td>
            <td class="py-3 text-error"> Secret </td>
            <td class="py-3"> Aug 26, 2023 </td>
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
            <td class="py-3 text-warning"> Confidential </td>
            <td class="py-3">Jan 20, 2022 </td>
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
            <td class="py-3 text-success"> Open </td>
            <td class="py-3"> April 5, 2023 </td>
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
