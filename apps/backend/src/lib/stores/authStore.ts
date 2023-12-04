import type { UserDocument } from '@armadillo/shared';
import type { User } from 'firebase/auth';

import { derived, readable } from 'svelte/store';

import { doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '$lib/firebase';
import { docStore, colUsersRef } from '$lib/firebase/firestore';

const authState = readable<User | null>(undefined, (set) => {
	// Prevent server-side from running
	if (typeof window === 'undefined') return;

	const unsubscribe = onAuthStateChanged(auth, set);
	return unsubscribe;
});

export const authStore = derived<typeof authState, UserDocument | null>(authState, ($user, set) => {
	// Prevent server-side from running
	if (typeof window === 'undefined') return;

	if (!$user) return set($user);

	const ref = doc(colUsersRef, $user.uid);
	return docStore<UserDocument>(ref).subscribe(set);
});
