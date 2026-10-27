# Backend Tests

This directory is reserved for automated tests of the SecureX backend.

## Recommended test coverage

1. Authentication: registration, login, invalid credentials, token expiry.
2. Authorization: users cannot access records outside their permitted scope.
3. Checkposts: creation, assignment, activation, and access restrictions.
4. Verifications: creation, status changes, history, and input validation.
5. Case reports: creation, ownership, and workflow status.
6. File processing: unsupported formats, oversized files, malformed files, and processing failures.
7. Security: password hashing, JWT validation, and safe error responses.

## Test data

Use synthetic records and temporary test databases. Never use production identity documents or real passwords.

## Running tests

Install the dependencies listed in this directory's `requirements.txt`, then use the test runner specified by the project.

Automated tests have not been documented as passing until they are implemented and executed.
