---
category: Bugfix
authors: [mcpeekj]
---

Fix pending transactions that never update to cleared after they post at the bank: a cleared re-download now matches its stored pending twin (even when the bank issues a new transaction id) and flips it to cleared instead of adding a duplicate. The reverse is also handled — a pending re-download of a transaction that already cleared no longer creates a duplicate, and pending and cleared versions of the same transaction arriving in one download are deduplicated
