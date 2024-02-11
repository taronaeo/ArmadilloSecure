<script lang="ts">
  import type { FSFile, FSFileClass } from '@armadillo/shared';

  import * as yup from 'yup';
  import * as mime from 'mime';

  import { v4 } from 'uuid';
  import { createForm } from 'svelte-forms-lib';

  import { dev } from '$app/environment';
  import { authStore } from '$lib/stores';

  import { colFilesRef } from '$lib/firebase/firestore';
  import { fileStorage } from '$lib/firebase/storage';
  import { ref, uploadBytes } from 'firebase/storage';
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

  interface FormValues {
    fileUpload: FileList | undefined;
    fileClass: FSFileClass | undefined;
    filePassword: string | undefined;
    isChecked: boolean;
  }

  const toggleModal = () => (show = !show);

  const { form, errors, handleChange, handleSubmit } = createForm<FormValues>({
    initialValues: {
      fileUpload: undefined,
      fileClass: undefined,
      filePassword: undefined,
      isChecked: false,
    },
    validationSchema: yup.object({
      fileUpload: yup.mixed().required('File is required!'),
      fileClass: yup.string().oneOf(['TOPSECRET', 'SENSITIVE', 'OPEN']),
      filePassword: yup
        .string()
        .required('File password is required')
        .min(8, 'Password must at least be 8 characters longs')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character'
        ),
      isChecked: yup
        .boolean()
        .oneOf(
          [true],
          'Please ensure you have selected the right classification by checking the checkbox.'
        ),
    }),
    onSubmit: async (data) => {
      // Just to please TypeScript because we are already using validationSchema above.
      if (!$authStore) return;
      if (!data.fileUpload || !data.fileClass || !data.isChecked || !data.filePassword) return;

      const formFile = data.fileUpload[0];
      const formFileName = v4();
      const formFileExt = formFile.name.split('.').pop() || '';
      const formFileBuffer = await formFile.arrayBuffer();

      const filePwdBuffer = new TextEncoder().encode(data.filePassword);
      const filePwdHashBuffer = await crypto.subtle.digest('SHA-256', filePwdBuffer);
      const filePwdHashArray = Array.from(new Uint8Array(filePwdHashBuffer));
      const filePwdHash = filePwdHashArray
        .map((char) => char.toString(16).padStart(2, '0'))
        .join('');

      const fileData: FSFile = {
        file_id: formFileName,
        file_status: 'UPLOADED',
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        file_domain: $authStore?.email?.split('@').pop()!, // TODO: Please change later
        file_classification: data.fileClass!,
        file_name: formFile.name,
        file_ext: formFileExt,
        file_owner_id: $authStore!.uid,
        file_encryption_hash: filePwdHash,
        file_encryption_iv: '',
        file_permissions: [],
        updated_at: serverTimestamp(),
        created_at: serverTimestamp(),
      };

      const docRef = doc(colFilesRef, formFileName);
      const storageRef = ref(fileStorage, `${$authStore.uid}/${formFileName}.${formFileExt}`);

      const setDocPromise = setDoc(docRef, fileData);
      const uploadDocPromise = uploadBytes(storageRef, formFileBuffer, {
        contentType: mime.getType(formFileExt) || 'application/octet-stream',
      });

      await Promise.all([setDocPromise, uploadDocPromise]).catch(console.error);
      toggleModal();
      if (dev) console.log('File uploaded successfully!');
    },
  });

  export let show = false;
</script>

{#if show}
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div
        class="p-4 min-h-full text-center
                flex items-end justify-center
                sm:p-0 sm:items-center">
        <div
          class="relative rounded-lg shadow-xl overflow-hidden
              bg-white text-left transform transition-all
                sm:my-8 sm:w-full sm:max-w-lg">
          <form class="my-4 px-4" on:submit|preventDefault={handleSubmit}>
            <div class="bg-white px-4 pb-4 pt-5">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <label for="fileUpload" class="text-base font-bold leading-6 text-gray-900">
                    Upload file
                  </label>
                  <input
                    id="fileUpload"
                    type="file"
                    name="fileUpload"
                    class="file-input file-input-md w-full"
                    on:change={handleChange} />
                  <div class="mt-1 max-h-10 overflow-hidden">
                    <span class="text-red-600">{$errors.fileUpload}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div
                  class="mt-3 text-center
                          sm:ml-4 sm:mt-0 sm:text-left">
                  <label for="fileClass" class="text-base font-bold leading-6 text-gray-900">
                    Select file class
                  </label>

                  <select
                    id="fileClass"
                    name="fileClass"
                    class="select select-bordered w-full max-w-ws"
                    on:change={handleChange}
                    bind:value={$form.fileClass}>
                    <option disabled selected value="">Select file class</option>
                    <option value="TOPSECRET">TOP SECRET</option>
                    <option value="SENSITIVE">SENSITIVE</option>
                    <option value="OPEN">OPEN</option>
                  </select>
                  <div class="mt-1 max-h-10">
                    <span class="text-red-600">{$errors.fileClass}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <label for="filePassword" class="text-base font-bold leading-6 text-gray-900">
                    Enter file password
                  </label>
                  <input
                    type="password"
                    id="filePassword"
                    placeholder="Enter File Password"
                    class="input input-bordered w-full max-w-xs"
                    on:change={handleChange} />
                  {#if $errors.filePassword}
                    <div class="mt-1">
                      <span class="text-red-600 block">{$errors.filePassword}</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
            <div>
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div
                    class="mt-3 text-center
                            sm:ml-4 sm:mt-0 sm:text-left">
                    <label for="isChecked" class="curor-pointer label">
                      <div class="flex items-center mt-0">
                        <input
                          id="isChecked"
                          type="checkbox"
                          checked={false}
                          class="checkbox bg-slate-200"
                          on:change={handleChange}
                          bind:value={$form.isChecked} />
                        <span class="label-text text-black m-2.5 font-bold">
                          I have specified the right classification
                        </span>
                      </div>
                    </label>
                    <div>
                      <span class="text-red-600">{$errors.isChecked}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="bg-gray-50 px-4 py-3
                      sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                class="px-3 py-2 text-sm font-semibold text-white
                      w-full shadow-sm rounded-md bg-indigo-600
                      inline-flex justify-center
                      sm:ml-3 sm:w-auto">
                Upload
              </button>

              <button
                type="button"
                on:click={toggleModal}
                class="px-3 py-2 text-sm font-semibold text-black
                      w-full shadow-sm rounded-md bg-gray-300
                      inline-flex justify-center
                      sm:ml-3 sm:w-auto">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
{/if}
