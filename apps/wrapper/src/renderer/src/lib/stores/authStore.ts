import type { FSUser } from '@armadillo/shared';
import type { User } from 'firebase/auth';

import { derived, readable } from 'svelte/store';

import { doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../../../../main/firebase';
import { docStore, colUsersRef } from '../../../../main/firebase/firestore';

const authState = readable<User | null>(undefined, (set) => {
  const unsubscribe = onAuthStateChanged(auth, set);
  return unsubscribe;
});

export const authStore = derived<typeof authState, FSUser | null>(authState, ($user, set) => {
  if (!$user) return set(null);

  const ref = doc(colUsersRef, $user.uid);
  return docStore<FSUser>(ref).subscribe(set);
});
