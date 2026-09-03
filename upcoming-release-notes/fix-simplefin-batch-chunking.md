---
category: Bugfix
authors: [mcpeekj]
---

Fix "All Accounts" SimpleFin sync sometimes skipping transactions: the bulk request sent every linked account to SimpleFin in a single call, and for some accounts SimpleFin returned a balance but an incomplete transaction list — so the account showed as synced while its new transactions were silently dropped (they only appeared if you synced that account individually). Accounts are now requested in smaller chunks so each SimpleFin response stays small enough to be complete, and a failed chunk no longer aborts the rest of the sync.
