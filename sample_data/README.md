# SecureX Sample Data

Use synthetic documents and fictional people for development, demonstrations, and testing.

## Suggested test cases

| ID | Scenario | Expected handling |
|---|---|---|
| SYN-001 | Clean synthetic document | Process normally; report only checks actually performed |
| SYN-002 | Intentionally altered date | Check for supported inconsistencies or anomalies |
| SYN-003 | Low-resolution scan | Report OCR uncertainty where applicable |
| SYN-004 | Corrupt PDF | Reject safely or return a controlled processing error |
| SYN-005 | Unsupported file type | Reject with a clear validation message |
| SYN-006 | QR code with mismatched visible data | Report a mismatch only if both values are extracted reliably |
| SYN-007 | No QR code present | Report that no QR code was detected, not that the document is fake |
| SYN-008 | Missing metadata | Record unavailable metadata without treating its absence as proof of tampering |

## Privacy and safety

- Do not commit real identity documents, identity numbers, passwords, or personal records.
- Do not use sample data from real people without appropriate permission.
- Keep expected outcomes documented so test results can be checked reproducibly.
- Do not report performance metrics until the tests have actually been executed.
- A test document is not an official issuer-verification result.
