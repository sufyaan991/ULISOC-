# ULISOC website — security review package

This archive contains ULISOC website source version 113 (`6176b7827ee790de651efe48f9134da05bd174f7`) for authorised security testing.

Excluded: Git history, deployment metadata, dependencies, generated output, environment files, API keys, passwords, service-account credentials and hosted database contents.

Runtime secret names remain visible so reviewers can assess the integrations. Actual values are held by the deployment environment. Legacy `JUMMAH_SESSION_SECRET` references are a temporary read-only migration bridge for records encrypted before key separation; new operations use `AUTH_SESSION_SECRET`, `MEMBERSHIP_HMAC_SECRET` and `DATA_ENCRYPTION_SECRET`.

The production Google Wallet credential remains encrypted in hosted storage and is not included. Automated pattern scans found no embedded private keys, committee password, Cali's member code or common API-token formats. This is a precautionary scan, not a security guarantee.
# WhatsApp automation boundary

The WhatsApp Linked Devices session does not run inside the public website or Cloudflare Worker. The separate `automation/whatsapp-worker` service has outbound-only behaviour, stores its session in a private persistent volume, and authenticates to the website with `ULISOC_AUTOMATION_SECRET`. No group messages, phone numbers or participant lists are stored by the website.
