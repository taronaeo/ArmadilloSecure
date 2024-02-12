<!-- JavaScript code -->
<script lang="ts">
  import type { FSFile, FSDomain, FSUser } from '@armadillo/shared';

  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import dayjs from 'dayjs';
  import * as yup from 'yup';

  import { createForm } from 'svelte-forms-lib';

  import {
    or,
    doc,
    where,
    query,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    Timestamp,
    onSnapshot,
    arrayUnion,
    FieldValue,
    serverTimestamp,
  } from 'firebase/firestore';

  import { firestore } from '$lib/firebase';
  import { signOut } from '$lib/firebase/auth';
  import { colFilesRef, colUsersRef } from '$lib/firebase/firestore';

  import { domainStore, authStore } from '$lib/stores';

  import FileUpload from '$lib/components/FileUpload.svelte';
  import { tempStorage } from '$lib/firebase/storage';
  import { getBlob, ref } from 'firebase/storage';

  // State variables
  let selfDestructModal: HTMLDialogElement;
  let fileAccessModal: HTMLDialogElement;
  let logoutModal: HTMLDialogElement;
  let settingsModal: HTMLDialogElement;
  let selectedFileId = '';
  let manageAccessEmailInput = '';
  let showInfoCard = false;
  let showFileUploadModal = false;
  let userFileDocs: FSFile[] = [];
  let selectedClassification: string | null = null;
  let selectedDateFilter: string | null = null;

  // Reactive Declarations
  $: fullName = $authStore?.full_name;
  $: profilePicUrl = `https://ui-avatars.com/api/?name=${fullName}&format=svg&rounded=true`;

  onMount(() => {
    if (!$authStore) return;

    const fsFilesRef = query(
      colFilesRef,
      or(
        where('file_owner_id', '==', $authStore.uid),
        where('file_permissions', 'array-contains', $authStore.uid)
      )
    );
    const unsubscribe = onSnapshot(fsFilesRef, (querySnapshot) => {
      userFileDocs = querySnapshot.docs.map((docSnapshot) => docSnapshot.data() as FSFile);
    });

    return unsubscribe;
  });

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

  function getClassByStatus(fileClass: string) {
    if (fileClass === 'OPEN') return 'text-error';
    if (fileClass === 'SENSITIVE') return 'text-warning';
    if (fileClass === 'TOPSECRET') return 'text-success';
    return;
  }

  function convertToArray(filePermissions: any): string[] {
    return typeof filePermissions.arrayUnion !== 'function' && filePermissions;
  }

  function convertToDate(createdAt: FieldValue) {
    if (!createdAt) return;

    // @ts-expect-error fromMillis is an actual function but is not being read properly
    const timestampDate = Timestamp.fromMillis(createdAt.toMillis()).toDate();
    const date = dayjs(timestampDate).format('DD MMM, YYYY');

    return date;
  }

  async function getUser(uid: string) {
    const fsUserRef = doc(colUsersRef, uid);
    const fsUserDoc = await getDoc(fsUserRef);
    const fsUserData = fsUserDoc.data() as FSUser;

    return fsUserData;
  }

  function checkIfFileMatchesDateFilter(file: FSFile) {
    const today = dayjs();
    // @ts-expect-error toDate is an actual function but is not being read properly
    const fileCreationDate = dayjs(file.created_at.toDate());

    switch (selectedDateFilter) {
      case 'TODAY':
        return fileCreationDate.isSame(today, 'day');
      case 'LAST_7_DAYS':
        return today.diff(fileCreationDate, 'day') <= 7;
      case 'LAST_30_DAYS':
        return today.diff(fileCreationDate, 'day') <= 30;
      case 'CURRENTYEAR':
        return fileCreationDate.year() === today.year();
      case 'PREVIOUSYEAR':
        return fileCreationDate.year() === today.year() - 1;
      default:
        return true;
    }
  }

  const showDetails = (file: FSFile) => {
    selectedFileId = file.file_id;
    showInfoCard = true;
  };

  const hideDetails = () => {
    showInfoCard = false;
  };

  const domainAdd = (() => {
    if ($authStore && $authStore.email) {
      return $authStore.email.split('@')[1];
    } else {
      return null;
    }
  })();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const previousYear = (currentDate.getFullYear() - 1).toString();

  async function deleteFile(fileId: string) {
    console.log(fileId);

    try {
      const fsFileRef = doc(colFilesRef, fileId);
      await deleteDoc(fsFileRef);

      hideDetails();
    } catch (error) {
      console.error('Error deleting file: ', error);
    }
  }

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

      if (!domainAdd) {
        console.error('Domain address not available');
        return;
      }

      const userDocRef = doc(firestore, 'domains', domainAdd);

      const domain: Omit<FSDomain, 'domain_administrators' | 'created_at'> = {
        domain_dns_suffix: data.domain_dns_suffix,
        domain_ipv4_start: data.domain_ipv4_start,
        domain_ipv4_end: data.domain_ipv4_end,
        updated_at: serverTimestamp(),
      };

      await setDoc(userDocRef, domain, {
        merge: true,
      }).catch(console.error);
    },
  });

  async function downloadWrapper(fileId: string) {
    const storageRef = ref(tempStorage, 'wrapper.exe');
    const wrapperBlob = await getBlob(storageRef);

    //Create temporary download link, will revoke later
    const fileUrl = URL.createObjectURL(wrapperBlob);
    const link = document.createElement('a');

    link.href = fileUrl;
    link.download = `${fileId}.exe`;
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
    }, 100);
  }

  async function selfDestructFile(fileId: string) {
    const docRef = doc(firestore, 'files', fileId);
    await updateDoc(docRef, {
      self_destruct: true,
    });
  }

  async function addAccessByEmail(fileId: string) {
    const fsFileRef = doc(colFilesRef, fileId);

    const searchUserQuery = query(colUsersRef, where('email', '==', manageAccessEmailInput));
    const searchUserSnapshot = await getDocs(searchUserQuery);

    const searchUserSnapshotArray = searchUserSnapshot.docs;
    if (searchUserSnapshotArray.length !== 1) return console.error('Account not found!');

    const [searchUserResult] = searchUserSnapshotArray;
    const foundUser = searchUserResult.data() as FSUser;

    const foundUserEmailArr = foundUser.email?.split('@') as Array<string>;
    const foundUserDomain = foundUserEmailArr[foundUserEmailArr.length - 1];

    const currentUserEmailArr = $authStore?.email?.split('@') as Array<string>;
    const currentUserDomain = currentUserEmailArr[currentUserEmailArr.length - 1];

    if (foundUserDomain !== currentUserDomain) return;

    const updatedFileDoc: Pick<FSFile, 'file_permissions' | 'updated_at'> = {
      file_permissions: arrayUnion(foundUser.uid),
      updated_at: serverTimestamp(),
    };

    await setDoc(fsFileRef, updatedFileDoc, { merge: true }).catch(console.error);

    console.log('Permissions Successfully Updated!');
  }

  async function getOwnerName(ownerId: string) {
    try {
      const fsUserRef = doc(colUsersRef, ownerId);
      const fsUserDoc = await getDoc(fsUserRef);

      if (fsUserDoc.exists()) {
        const fsUserData = fsUserDoc.data() as FSUser;
        return fsUserData.full_name;
      } else {
        return 'Owner Not Found';
      }
    } catch (error) {
      console.error('Error fetching owner details:', error);
      return 'Error';
    }
  }
</script>

<FileUpload bind:show={showFileUploadModal} />

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
            <button on:click={() => (showFileUploadModal = !showFileUploadModal)}>
              <img src="fileicon.svg" alt="File Icon" />
              File Upload
            </button>
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
                        disabled
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
                    <!-- <div class="flex justify-end">
                      <button
                        type="submit"
                        class="
                        w-24 mt-8 mb-2 btn btn-secondary
                        hover:ring-2 hover:ring-info">
                        Save
                      </button>
                    </div> -->
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
                              value={domainAdd}
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
                      on:click={() => signOut(console.error)}>
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
            <a href="/home" on:click={() => (selectedClassification = 'OPEN')}> Open </a>
          </li>
          <hr />
          <li>
            <a href="/home" on:click={() => (selectedClassification = 'SENSITIVE')}> Sensitive </a>
          </li>
          <hr />
          <li>
            <a href="/home" on:click={() => (selectedClassification = 'TOPSECRET')}> Top Secret </a>
          </li>
        </ul>
      </div>

      <!-- Type Dropdown -->
      <div class="dropdown dropdown-bottom">
        <div
          tabindex="0"
          role="button"
          class="btn m-1 font-semibold normal-case px-6 border-white hover:border-white">
          Creation Date
          <span>
            <img src="dropdownarrow.svg" alt="Dropdown Arrow" />
          </span>
        </div>
        <ul class="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border">
          <li>
            <a href="/home" on:click={() => (selectedDateFilter = 'TODAY')}> Today </a>
          </li>
          <li>
            <a href="/home" on:click={() => (selectedDateFilter = 'LAST_7_DAYS')}> Last 7 Days </a>
          </li>
          <li>
            <a href="/home" on:click={() => (selectedDateFilter = 'LAST_30_DAYS')}>
              Last 30 Days
            </a>
          </li>
          <li>
            <a href="/home" on:click={() => (selectedDateFilter = 'CURRENTYEAR')}>
              This Year ({currentYear})
            </a>
          </li>
          <li>
            <a href="/home" on:click={() => (selectedDateFilter = 'PREVIOUSYEAR')}>
              Last Year ({previousYear})
            </a>
          </li>
        </ul>
      </div>

      <!-- Clear All Button -->
      <button
        class="btn font-semibold normal-case px-6 rounded-full border-none bg-transparent"
        on:click={() => {
          selectedClassification = null;
          selectedDateFilter = null;
        }}>
        Clear all
      </button>
    </div>

    <div class="overflow-x-auto mt-5">
      {#if userFileDocs && userFileDocs.length > 0}
        <table class="w-full">
          <!-- Table Headers -->
          <thead>
            <tr class="border-b text-left py-2">
              <th class="py-3"> Name </th>
              <th class="py-3"> Classification </th>
              <th class="py-3"> Date Uploaded </th>
              <th class="py-3"> File Extension </th>
              <th class="py-3"> File Status </th>
              <th class="py-3"></th>
              <th class="py-3"></th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody>
            {#if userFileDocs}
              {#each userFileDocs as file}
                {#if (!selectedClassification || file.file_classification === selectedClassification) && (!selectedDateFilter || checkIfFileMatchesDateFilter(file))}
                  <tr class="py-2 border-b text-left duration-80 hover:bg-zinc-900">
                    <td class="py-3">{file.file_name}</td>
                    <td class="py-3 {getClassByStatus(file.file_classification)}"
                      >{file.file_classification}</td>
                    <td class="py-3">{convertToDate(file.created_at)}</td>
                    <td class="py-3">{file.file_ext}</td>
                    <td class="py-3">{file.file_status}</td>
                    <th class="text-center">
                      <button
                        on:click={() => showDetails(file)}
                        class="btn btn-ghost btn-xs hover:text-info">
                        details
                      </button>
                    </th>
                    <th class="text-center">
                      <button
                        on:click={() => {
                          downloadWrapper(file.file_id);
                        }}
                        class="btn btn-ghost btn-xs hover:text-info">
                        download
                      </button>
                    </th>
                  </tr>
                {/if}
              {/each}
            {:else}
              <tr>
                <td colspan="5">Loading files...</td>
              </tr>
            {/if}
          </tbody>
        </table>
      {:else}
        <p class="mt-40 text-center"> You haven't uploaded any files yet. Please upload a file. </p>
      {/if}
    </div>
  </div>

  <!-- Info Card -->
  {#if showInfoCard && selectedFileId !== null}
    {#each userFileDocs as file}
      {#if selectedFileId === file.file_id}
        <div
          in:fade={{ duration: 300 }}
          out:fade={{ duration: 300 }}
          class="w-96 max-w-7xl h-screen p-5 rounded-md border border-white">
          <div class="flex items-center pb-2">
            <h1 class="flex-grow font-semibold">{file.file_name}</h1>
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
                  <h3 class="font-bold text-lg pb-2">{file.file_name}</h3>

                  <div class="input-group">
                    {#if file.file_owner_id === $authStore?.uid}
                      <input
                        type="text"
                        bind:value={manageAccessEmailInput}
                        placeholder="Add People by Email"
                        class="input input-bordered w-full max-w-2xl text-sm
                              focus:ring-info focus:border-info duration-300 focus:outline-none" />

                      <button class="btn" on:click={() => addAccessByEmail(file.file_id)}>
                        Add
                      </button>
                    {/if}
                  </div>
                  <div class="font-light text-sm italic text-red-200">
                    Can only assign access to the same domain as you
                  </div>
                  <p class="py-4 font-semibold">People with Access</p>

                  <!-- Owner with Access -->
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

                  <!-- Users with Access -->
                  {#each convertToArray(file.file_permissions) as userId}
                    {#if userId !== $authStore?.uid}
                      {#await getUser(userId) then user}
                        <div class="flex items-center py-2">
                          <img
                            class="rounded w-9 mr-3"
                            alt="User Profile Circle"
                            src={`https://ui-avatars.com/api/?name=${user.full_name}&format=svg&rounded=true`} />
                          <div class="flex flex-col">
                            <div class="font-bold">
                              <p>{user.full_name}</p>
                            </div>
                            <div class="text-sm">
                              <p>{user.email}</p>
                            </div>
                          </div>
                        </div>
                      {:catch}
                        <div class="flex items-center py-2"> Error Getting User! </div>
                      {/await}
                    {/if}
                  {/each}

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

            <!-- File Owner -->
            <div class="py-2 text-sm">
              <p>Owner</p>
              {#await getOwnerName(file.file_owner_id)}
                <p>Retrieving...</p>
              {:then ownerName}
                <p class="text-info">{ownerName}</p>
              {:catch error}
                <p>Error fetching owner</p>
              {/await}
            </div>

            <!-- File Classification Section -->
            <div class="py-2 text-sm">
              <p>Class</p>
              <p class={getClassByStatus(file.file_classification)}>{file.file_classification}</p>
            </div>

            <!-- File Type Section -->
            <div class="py-2 text-sm">
              <p>Type</p>
              <p class="text-info">{file.file_ext}</p>
            </div>

            <!-- File Domain Section -->
            <div class="py-2 text-sm">
              <p>Domain</p>
              <p class="text-info">{file.file_domain}</p>
            </div>

            <!-- File Created at Section -->
            <div class="py-2 text-sm">
              <p>Created Date</p>
              <p class="text-info">{convertToDate(file.created_at)}</p>
            </div>

            <!-- File Status Section -->
            <div class="py-2 text-sm">
              <p>Status</p>
              <p class="text-info">{file.file_status}</p>
            </div>

            <!-- Manual Self Destruct Button -->
            {#if $authStore?.uid === file.file_owner_id}
              <div class="pt-4">
                <div class="py-2">
                  <button
                    class="py-4 w-full btn"
                    on:click={() => {
                      showSelfDestructModal();
                      selfDestructFile(file.file_id);
                    }}>
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
                        btn btn-outline btn-error"
                    on:click={() => deleteFile(file.file_id)}>
                    Delete
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/each}
  {/if}
</div>
