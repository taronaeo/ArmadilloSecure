from firebase_functions import identity_fn

@identity_fn.before_user_created()
def auth_on_user_create(event: identity_fn.AuthBlockingEvent) \
    -> identity_fn.BeforeCreateResponse | None:
    """
    Firebase Auth Create Blocking Cloud Function that creates user document.

    Args:
        event (identity_fn.AuthBlockingEvent): The blocked event.
    Returns:
        An empty BeforeCreateResponse object.
    """
    from google.cloud import firestore
    from models.User import User

    firestore_client = firestore.Client()

    user_data = event.data
    user_uid = user_data.uid
    user_email = user_data.email

    user_ref = firestore_client.document('users', user_uid)
    user_doc = User(uid=user_uid, email=user_email)

    user_ref.set(document_data=user_doc.to_dict(), merge=True)
    return identity_fn.BeforeCreateResponse()
