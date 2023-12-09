from firebase_admin import initialize_app
from firebase_functions.options import set_global_options

initialize_app()

set_global_options(
  max_instances=1,
  region='asia-southeast1'
)
