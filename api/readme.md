# API

- This is a thin layer around the SQLite database, so only a few validations and no mandatory permission checking
- Validation for things like sane usernames or passwords should be handled at HTTP-API level
- Checking permissions must be enforced at HTTP-API level
