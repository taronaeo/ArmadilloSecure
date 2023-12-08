import type { FieldValue } from 'firebase/firestore';

interface UserDocument {
  readonly uid: string;
  email: string | undefined;
  readonly email_verified: boolean | null;
  full_name: string | null;
  headshot_url: string | null;
  readonly is_onboarded: boolean;
  readonly is_suspended: boolean;
  readonly updated_at: FieldValue;
  readonly created_at: FieldValue;
}

export type { UserDocument };
