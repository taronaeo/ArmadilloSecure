import type { DocumentReference } from 'firebase/firestore';

import { readable } from 'svelte/store';
import { doc, collection, onSnapshot } from 'firebase/firestore';

import { firestore } from '../firebase';

export const colUsersRef = collection(firestore, 'users');
export const colFilesRef = collection(firestore, 'files');

export function docStore<T>(pathOrRef: string | DocumentReference) {
  let unsubscribe: () => void;
  let ref: DocumentReference;

  if (typeof pathOrRef !== 'string') ref = pathOrRef;
  else ref = doc(firestore, pathOrRef);

  const { subscribe } = readable<T | null>(undefined, (set) => {
    unsubscribe = onSnapshot(ref, (snap) => set((snap.data() as T) ?? null));
    return () => unsubscribe();
  });

  return {
    subscribe,
    _ref: ref,
    _id: ref.id,
  };
}
