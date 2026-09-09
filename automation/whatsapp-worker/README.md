# ULISOC WhatsApp Jumu'ah worker

This continuously running Node.js service links a dedicated WhatsApp account to the current ULISOC Jumu'ah database. It uses the unofficial `whatsapp-web.js` client, so use a dedicated number and expect occasional re-linking after WhatsApp updates.

## Safety

- `DRY_RUN=true` and `SCHEDULER_ENABLED=false` are the defaults.
- No incoming messages or member details are read or stored.
- `.env`, the Linked Devices session and send history stay in the persistent `data` volume and are excluded from Git.
- Live manual sending requires both `DRY_RUN=false` and the `--confirm` flag used by `npm run send-now`.
- The same target/Friday cannot be sent twice unless `--force` is deliberately added.

## First setup

1. Copy `.env.example` to `.env`.
2. Put the same random 32+ character `ULISOC_AUTOMATION_SECRET` in the worker and the website runtime settings.
3. Keep `DRY_RUN=true` and `SCHEDULER_ENABLED=false`.
4. Run `npm install`, then `npm run list-groups`.
5. On the dedicated phone, open WhatsApp → Linked Devices → Link a device and scan the terminal QR.
6. Copy the Committee chat's `@g.us` ID into `TARGET_GROUP_ID`.
7. Run `npm run dry-run`. The worker writes the compressed 1080 × 1350 JPEG preview into `data/previews` but sends nothing.
8. After checking the JPEG and caption, set `DRY_RUN=false` and run `npm run send-now` for one deliberate Committee-chat test.

## Group selection and media mode

- `npm run resolve-group` resolves an invite link locally and prints the exact `@g.us` ID without storing the private link.
- `MEDIA_MODE=hd` sends an inline HD image. This worked reliably in a newly created standalone test group.
- `MEDIA_MODE=document` sends the JPEG as a document. This was the reliable fallback for older and Community-linked groups during September 2026 testing.
- Use `SAFE_TEST_GROUP_ID`, `ALLOW_TEST_SEND=true`, `SCHEDULER_ENABLED=false` and `LOCAL_TEST_DATE=YYYY-MM-DD` together for a controlled fixture test. Remove `LOCAL_TEST_DATE` and disable `ALLOW_TEST_SEND` afterwards.
- The worker remains unofficial WhatsApp automation. Keep the dedicated society number, avoid bulk messaging, and expect future WhatsApp changes to require maintenance.

Do not target ULISOC General or enable `SCHEDULER_ENABLED` during the first milestone.

## Account swap

Stop the worker, remove only the configured `AUTH_DIR`, restart it and scan the new account's QR. The website never stores a phone number. Ensure the replacement account is in the target group.

## Docker

Create `.env`, then run `docker compose run --rm whatsapp-worker npm run list-groups`. The named `whatsapp-data` volume preserves the Linked Devices session across restarts. Once testing is complete, `docker compose up -d` runs the service.
