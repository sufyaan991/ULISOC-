# ULISOC complete source package

This package contains the complete v114 website source, public assets, database schema and migrations, security documentation, tests, hosting configuration, and the latest local WhatsApp Jumu'ah worker.

The WhatsApp worker includes:

- JPEG poster capture and compression
- inline HD and document media modes
- exact group-ID fixture safety checks
- duplicate-send state tracking
- invite-link group resolution
- four-minute browser protocol timeouts
- the reproducible WhatsApp Web navigation-safety post-install patch

Intentionally excluded from this package:

- `.env` files and runtime secrets
- paired WhatsApp session data
- generated posters and send history
- `node_modules`, caches, and local build output

Copy `automation/whatsapp-worker/.env.example` to `.env` and supply fresh secrets locally. Never commit or share the completed `.env` file.
