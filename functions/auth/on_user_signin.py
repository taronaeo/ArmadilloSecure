from firebase_functions import https_fn, identity_fn

@identity_fn.before_user_signed_in()
def auth_on_user_signin(event: identity_fn.AuthBlockingEvent) \
    -> identity_fn.BeforeSignInResponse | None:
    """
    Firebase Auth SignIn Blocking Cloud Function that checks if sign in is suspicious.

    Args:
        event (identity_fn.AuthBlockingEvent): The blocked event.
    Returns:
        An empty BeforeSignInResponse object.
    """
    # TODO: Re-enable suspicious login checking
    # from iptocc import get_country_code

    # if get_country_code(event.ip_address) != 'SG':
    #     raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.PERMISSION_DENIED, message='Authentication is only available from Singapore')

    return identity_fn.BeforeSignInResponse()
