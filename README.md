# Ziqx Connect

Next.js WhatsApp CRM inbox for Ziqx. Screens run on the App Router. Sends and template sync use Meta Graph API on the server. The Meta webhook is the only HTTP route handler.

## Requirements

- Node.js 20.9+
- PostgreSQL, with a database the app can create tables in
- A WhatsApp Cloud API phone number and system user token (optional while demo mode is on)

## Setup

```sh
npm install
cp .env.example .env.local
# Fill Meta credentials in .env.local
npm run dev
```

UI controls use [`@ziqx/react-comps`](https://www.npmjs.com/package/@ziqx/react-comps) (`Button`, `Input`, `Select`, `Checkbox`) with Connect brand colors from `src/lib/ui.ts`.

App: [http://localhost:3000](http://localhost:3000)

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. The inbox creates its tables and seeds the design conversations when the database is empty |
| `WHATSAPP_DEMO_MODE` | `true` for UI testing without Meta (default when credentials are empty) |
| `META_GRAPH_VERSION` | Graph API version (default `v21.0`) |
| `META_SYSTEM_USER_TOKEN` | Business access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Cloud API phone number id |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WABA id |
| `META_WEBHOOK_VERIFY_TOKEN` | Token Meta sends on webhook verification |
| `META_APP_SECRET` | HMAC secret for `X-Hub-Signature-256` |
| `META_MARKETING_PRODUCT_POLICY` | `CLOUD_API_FALLBACK` or `STRICT` |

## Webhook

Point Meta’s WhatsApp callback to:

```text
https://<your-public-host>/api/whatsapp/webhook
```

Subscribe the app to `messages`. Local development needs a public HTTPS tunnel; the app does not start one.

## Scripts

```sh
npm run dev
npm run build
npm run start
```

## Layout

```text
src/
  app/                 # routes, layouts, webhook
  components/
    shell/             # sidebar + app chrome
    contacts/
    inbox/
    templates/
    settings/
  data/                # local mock contacts / team
  lib/whatsapp/        # Graph client, Postgres store, actions, webhook
  types.ts
```

## Notes

- Contacts stay in browser memory for this slice.
- Inbox threads are stored in Postgres and survive a server restart.
- Without Meta credentials, Settings shows disconnected and sends stay in demo mode.
