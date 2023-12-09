from google.cloud import firestore

class User:
    def __init__(
            self,
            uid: str,
            email: str | None,
            email_verified: bool | None = False,
            full_name: str | None = None,
            headshot_url: str | None = None,
            is_onboarded: bool = False,
            is_suspended: bool = False,
            updatedAt = firestore.SERVER_TIMESTAMP,
            createdAt = firestore.SERVER_TIMESTAMP,
    ):
        self.uid = uid
        self.email = email
        self._email_verified = email_verified
        self.full_name = full_name
        self.headshot_url = headshot_url
        self._is_onboarded = is_onboarded
        self._is_suspended = is_suspended
        self._updatedAt = updatedAt
        self._createdAt = createdAt

    @staticmethod
    def from_dict(source):
        # TODO: Convert dict objects to User class
        pass

    def to_dict(self):
        return {
            "uid": self.uid,
            "email": self.email,
            "email_verified": self._email_verified,
            "full_name": self.full_name,
            "headshot_url": self.headshot_url,
            "is_onboarded": self._is_onboarded,
            "is_suspended": self._is_suspended,
            "updatedAt": self._updatedAt,
            "createdAt": self._createdAt
        }

    def __repr__(self) -> str:
        return f"User(\
                    uid={self.uid}, \
                    email={self.email}, \
                    email_verified={self._email_verified}, \
                    full_name={self.full_name}, \
                    headshot_url={self.headshot_url}, \
                    is_onboarded={self._is_onboarded}, \
                    is_suspended={self._is_suspended}, \
                    updatedAt={self._updatedAt}, \
                    createdAt={self._createdAt}\
                )"