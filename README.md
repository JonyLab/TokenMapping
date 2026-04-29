# Token Mapping

Token Mapping is a lightweight design token mapping platform for organizing variables across multiple collections and linking them from primitive values to semantic and component-level aliases.

It is built as a browser-first tool with an Express static server and Supabase-backed authentication and storage.

## Features

- Manage multiple token mapping projects per user.
- Create, rename, and delete token collections.
- Add variables with groups, hex values, and references to tokens in earlier collections.
- Draw and inspect token relationships visually.
- Focus a token to see only related upstream and downstream mappings.
- Batch edit variables in a dense table workflow.
- Import tokens from JSON arrays, Token Studio / W3C DTCG-style nested JSON, Figma variable export shapes, and CSS variables.
- Export mapped tokens as `tokens.json`.
- Persist projects and mappings with Supabase row-level security.

## Tech Stack

- Node.js
- Express
- Vanilla HTML, CSS, and JavaScript
- Supabase Auth and Postgres

## Project Structure

```text
.
├── index.html       # App shell and UI markup
├── main.js          # Token editor, import/export, Supabase logic
├── style.css        # Application styling
├── server.js        # Express server and runtime config endpoint
├── schema.sql       # Supabase tables and RLS policies
├── .env.example     # Environment variable template
└── logo.png
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Fill in your Supabase credentials in `.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-publishable-or-anon-key
PORT=3000
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If `PORT` is not set, the server defaults to `55872`.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run the contents of `schema.sql`.
4. Enable the OAuth providers you want to use:
   - GitHub
   - Google
5. Configure auth URLs for local development:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000`

The schema creates:

- `projects`: project metadata owned by each authenticated user.
- `token_mappings`: JSON-backed token collection and mapping data per project.

Both tables use row-level security so users can only read and write their own data.

## Import Formats

The importer accepts several common token formats:

### JSON Array

```json
[
  { "level": "Primitive", "name": "Blue/blue-500", "value": "#3B82F6" },
  { "level": "Semantic", "name": "Action/primary", "value": "blue-500" }
]
```

### CSS Variables

```css
--blue-500: #3B82F6;
--color-primary: #3B82F6;
```

Nested token JSON, Token Studio exports, W3C DTCG-style values, and Figma variable-like exports are also supported.

## Development Notes

- Do not commit `.env`; it is intentionally ignored.
- Supabase keys are served to the frontend through `/api/config`.
- Application data autosaves after edits when a project is open.
- `schema.sql` should be applied manually when creating or updating the Supabase database.

## Scripts

```bash
npm run dev
npm start
```

Both scripts run `node server.js`.
