<script lang="ts">
	import { firestore } from '$lib/firebase';
	import { collection, addDoc, getFirestore } from 'firebase/firestore';
	import { storage } from '$lib/firebase';
	import type { FirebaseStorage } from 'firebase/storage';
	import { getStorage, ref, uploadBytes } from 'firebase/storage';
	import { Form, Field, Select, ErrorMessage, createForm } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import type { FirebaseApp } from 'firebase/app';
	import { v4 } from 'uuid';

	interface FormValues {
		fileUpload: FileList | undefined;
		fileClass: string;
		isChecked: boolean;
		fileEncryptionHash: string;
		fileExtension: string;
		fileId: string;
		fileName: string;
		fileOwnerId: string;
	}

	const { form, errors, handleChange, handleSubmit } = createForm<FormValues>({
		initialValues: {
			fileUpload: undefined,
			fileClass: 'Select file class',
			isChecked: false,
			fileEncryptionHash: '',
			fileExtension: '',
			fileId: '',
			fileName: '',
			fileOwnerId: ''
		},
		validationSchema: yup.object({
			fileUpload: yup.string().required('File is required!'),
			fileClass: yup.string().oneOf(['TOPSECRET', 'SENSITIVE', 'OPEN']),
			isChecked: yup
				.boolean()
				.oneOf(
					[true],
					'Please ensure you have selected the right classification by checking the checkbox.'
				)
		}),
		onSubmit: async (data) => {
			console.log(data);
			var uniqueId = v4();

			if (!data.fileUpload || data.fileClass === 'Select file class' || !data.isChecked) {
				console.error('Missing required data!');
				return; // Early return if fields are missing
			}

			const file = data.fileUpload[0];
			const fileArrayBuffer = await file.arrayBuffer();
			uploadBytes(ref(getStorage(), `armadillo-files/${uniqueId}`), fileArrayBuffer)
				.then(console.log)
				.catch(console.error);
			// const fileData = Buffer.from(await data.fileUpload![0].arrayBuffer());
			// console.log(fileData.toString('base64'));

			const docRef = await addDoc(collection(firestore, 'files'), {
				file_classification: data.fileClass,
				file_encryption_hash: data.fileEncryptionHash,
				file_extension: file.name.split('.').pop(),
				file_name: file.name,
				file_id: uniqueId,
				file_owner_id: data.fileOwnerId
			});
			console.log('File uploaded successfully!');
		}
	});
</script>

<svelte:head>
	<title>FileUpload</title>
</svelte:head>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
				<form class="my-4 px-4" on:submit|preventDefault={handleSubmit}>
					<div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
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
							<div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
								<label for="fileClass" class="text-base font-bold leading-6 text-gray-900">
									Select file class
								</label>

								<select
									id="fileClass"
									name="fileClass"
									class="select select-bordered w-full max-w-ws"
									on:change={handleChange}
									bind:value={$form.fileClass}>
									<option disabled selected>Select file class</option>
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
								<div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
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
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button
							type="submit"
							class="inline-flex w-full justify-center rounded-md bg-indigo px-3 py-2 text-sm font-semibold text-white shadow-sm bg-indigo-600 sm:ml-3 sm:w-auto">
							Upload
						</button>

						<button
							type="button"
							class="inline-flex w-full justify-center rounded-md bg-indigo px-3 py-2 text-sm font-semibold text-black shadow-sm bg-gray-300 sm:ml-3 sm:w-auto">
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
