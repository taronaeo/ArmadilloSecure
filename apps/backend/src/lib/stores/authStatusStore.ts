import type { AuthStatus } from '$lib/models';

import { writable } from 'svelte/store';

export const authStatusStore = writable<AuthStatus | null>(null);
