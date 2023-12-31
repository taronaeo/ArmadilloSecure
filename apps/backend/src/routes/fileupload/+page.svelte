<script lang="ts">
  import type { FSFileDocument, FSFileClassification } from '@armadillo/shared';

  import * as yup from 'yup';
  import { v4 } from 'uuid';
  import { createForm } from 'svelte-forms-lib';

  import { dev } from '$app/environment';
  import { authStore } from '$lib/stores';

  import { colFilesRef } from '$lib/firebase/firestore';
  import { ref, getStorage, uploadBytes } from 'firebase/storage';
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

  interface FormValues {
    fileUpload: FileList | undefined;
    fileClass: FSFileClassification | undefined;
    isChecked: boolean;
  }

  const { form, errors, handleChange, handleSubmit } = createForm<FormValues>({
    initialValues: {
      fileUpload: undefined,
      fileClass: undefined,
      isChecked: false,
    },
    validationSchema: yup.object({
      fileUpload: yup.mixed().required('File is required!'),
      fileClass: yup.string().oneOf(['TOPSECRET', 'SENSITIVE', 'OPEN']),
      isChecked: yup
        .boolean()
        .oneOf(
          [true],
          'Please ensure you have selected the right classification by checking the checkbox.'
        ),
    }),
    onSubmit: async (data) => {
      // ! PLEASE REMEMBER TO SIGN IN WHEN TESTING !
      // ! PLEASE REMEMBER TO SIGN IN WHEN TESTING !
      // ! PLEASE REMEMBER TO SIGN IN WHEN TESTING !
      // ! PLEASE REMEMBER TO SIGN IN WHEN TESTING !

      // Just to please TypeScript because we are already using validationSchema above.
      if (!data.fileUpload || !data.fileClass || !data.isChecked) return;

      const fileUniqueId = v4();
      const formFile = data.fileUpload[0];
      const formFileBuffer = await formFile.arrayBuffer();

      const fileData: FSFileDocument = {
        file_id: fileUniqueId,
        file_classification: data.fileClass!,
        file_name: formFile.name,
        file_ext: formFile.name.split('.').pop() || '',
        file_owner_id: $authStore!.uid,
        file_encryption_hash: '',
        file_permissions: [],
        updated_at: serverTimestamp(),
        created_at: serverTimestamp(),
      };

      const docRef = doc(colFilesRef);
      const storageRef = ref(getStorage(), `armadillo-files/${fileUniqueId}`);

      const setDocPromise = setDoc(docRef, fileData);
      const uploadDocPromise = uploadBytes(storageRef, formFileBuffer);

      await Promise.all([setDocPromise, uploadDocPromise]).catch(console.error);
      if (dev) console.log('File uploaded successfully!');
    },
  });
</script>

<svelte:head>
  <title>FileUpload</title>
</svelte:head>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
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
          <div
            class="bg-white px-4 pb-4 pt-5
                      sm:p-6 sm:pb-4">
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
