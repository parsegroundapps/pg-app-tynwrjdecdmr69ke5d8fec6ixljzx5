# SashiDo Backend - Parse Server App

> Your SashiDo appname is: `SashiDo-Demo App`

## How SashiDo & GitHub Work Together

SashiDo automatically deploys code pushed to the `master` branch. The deployment pipeline:

```
Your Code → git push → GitHub (master) → SashiDo auto-deploys → Live
```

**Best Practice:** Create a separate development app in SashiDo for testing. Only pushes to `master` trigger automatic deployments, so other branches won't deploy.
- [GitHub Flow Tips and Tricks](https://www.sashido.io/en/blog/the-github-flow-tips-and-tricks)


---

## Adding Collaborators

Add collaborators through **SashiDo Dashboard** → App → App Settings → General. Click 'Save' in the lower right. Collaborators will receive an invitation email and, once confirmed, automatically get access to this GitHub repository.

**Best Practices:**
- Remove collaborators who no longer need access via SashiDo Dashboard → App Settings → General
- Collaborators must [link their SashiDo account to Github](https://www.sashido.io/en/blog/how-to-start-using-github-with-sashido-for-beginners) first, before gaining repository access.

**Resources:**
- [How to Add Collaborators in SashiDo](https://www.sashido.io/en/blog/sashidos-getting-started-guide#invite-your-team-to-collaborate-on-your-projects)

---

## Project Structure

The `cloud/` directory contains server-side code that runs on SashiDo. The `public/` directory serves static assets. `index.js` is only used for local development.

```
├── cloud/
│   ├── main.js       ← Entry point for SashiDo (DO NOT RENAME)
│   ├── app.js        ← Express routes (custom APIs, SPA fallback)
│   └── functions.js  ← Parse Cloud Functions & Triggers
├── public/           ← Static files (HTML, CSS, JS, images)
│   └── index.html
├── index.js          ← Local development only (ignored by SashiDo)
└── package.json
```

---

## How Requests Are Handled

Request routing follows a specific order: static files are served first, then Parse API routes, and finally your Express app handles everything else. This ensures proper request handling priority.

```
Request
   ↓
┌──────────────────────────────────────┐
│  1. Static Files (public/)           │  ← /css/style.css, /favicon.ico
├──────────────────────────────────────┤
│  2. Parse API (/1/*)                 │  ← /1/classes/Todo, /1/login
├──────────────────────────────────────┤
│  3. Your Express App (cloud/app.js)  │  ← /api/custom, /hello, /*
└──────────────────────────────────────┘
```

| Request | Handled By |
|---------|------------|
| `/css/main.css` | Static file from `public/` |
| `/1/classes/User` | Parse Server (REST API) |
| `/1/functions/myFunc` | Parse Cloud Function |
| `/hello-advanced` | Express route in `app.js` |
| `/login`, `/dashboard` | SPA fallback → `index.html` |

---

## Cloud Code Guide

Cloud Code runs server-side logic on SashiDo's infrastructure. Use it for data validation, business logic, and operations that shouldn't run in the browser.

### Parse Cloud Functions (`cloud/functions.js`)

Cloud Functions are serverless functions callable from your app via Parse SDK or REST API. They execute on-demand and have access to the Parse context (user, request params, etc.).

```javascript
// Simple function
Parse.Cloud.define('hello', (req) => {
    return 'Hello, ' + (req.params.name || 'World');
});

// Function with user context
Parse.Cloud.define('getMyData', async (req) => {
    if (!req.user) throw new Error('Not authenticated');
    // ... your logic
});
```

**Call via REST:**
```bash
curl -X POST https://your-app.sashido.io/1/functions/hello \
  -H "X-Parse-Application-Id: YOUR_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Developer"}'
```

### Triggers (`cloud/functions.js`)

Triggers automatically execute code when database operations occur. Use `beforeSave` for validation and `afterSave` for side effects like notifications or data synchronization.

```javascript
Parse.Cloud.beforeSave('Todo', (req) => {
    if (!req.object.get('title')) {
        throw new Error('Title is required');
    }
});

Parse.Cloud.afterSave('Todo', (req) => {
    console.log('Todo saved:', req.object.id);
});
```

### Express Routes (`cloud/app.js`)

Express routes let you create custom HTTP endpoints beyond Parse's built-in API. Useful for webhooks, custom authentication flows, or integrating with third-party services.

```javascript
const express = require('express');
const app = express();

// JSON body parser (if needed)
app.use(express.json());

// Custom API endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.post('/api/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.json({ received: true });
});

module.exports = app;
```

---

## SPA Fallback (Single Page Apps)

SPAs handle routing client-side, but direct URL visits (or page refreshes) need the server to serve `index.html`. This catch-all route ensures all non-API routes return your SPA's entry point.

Add this route at the **end** of `cloud/app.js`:

```javascript
const path = require('path');

// ... your other routes ...

// SPA Fallback - must be last
app.get('*', (req, res, next) => {
    // Skip static files (requests with extensions)
    if (req.path.includes('.')) {
        return next();
    }
    // Serve index.html for client-side routing
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});
```

This ensures any route without a file extension returns `index.html`, letting your frontend router handle navigation.

---

## Local Development

Run Parse Server locally to test Cloud Code and Express routes before deploying. The local setup mirrors SashiDo's production environment.

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally (or use a cloud instance)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment** (optional):
   ```bash
   export DATABASE_URI=mongodb://localhost:27017/dev
   export APP_ID=myAppId
   export MASTER_KEY=yourMasterKey
   export SERVER_URL=http://localhost:1337/1
   export PORT=1337
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. Open http://localhost:1337

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URI` | `mongodb://localhost:27017/dev` | MongoDB connection |
| `APP_ID` | `myAppId` | Parse Application ID |
| `MASTER_KEY` | `masterKey` | Parse Master Key |
| `SERVER_URL` | `http://localhost:1337/1` | Parse Server URL |
| `PORT` | `1337` | Server port |
| `PARSE_MOUNT` | `/1` | Parse API mount path |

---

## Deploying to SashiDo

Deployment is automatic via Git. Push to `master` and SashiDo deploys your changes within seconds.

```bash
git add .
git commit -m "Your changes"
git push origin master
```

SashiDo auto-deploys on every push to `master`.

### Deploy SPA Build

Build your frontend app and output the compiled files to `public/`. The build process optimizes and bundles your code for production.

```bash
# Build your frontend (output to public/)
ng build --output-path=public      # Angular
npm run build -- --outDir=public   # React/Vue (adjust as needed)

# Deploy
git add public/
git commit -m "Frontend build"
git push origin master
```

---

## Quick Reference

| Task | Location |
|------|----------|
| Add a Cloud Function | `cloud/functions.js` |
| Add a database trigger | `cloud/functions.js` |
| Add a custom API route | `cloud/app.js` |
| Serve static files | `public/` folder |
| Configure local dev | `index.js` (not used on SashiDo) |

---

## Useful Links


- [SashiDo Blog](https://www.sashido.io/en/blog)
- [SashiDo Getting Started Guide Part 1](https://www.sashido.io/en/blog/sashidos-getting-started-guide) and [Part 2](https://www.sashido.io/en/blog/sashidos-getting-started-guide-part-2)
- [Parse Cloud Code Guide](https://docs.parseplatform.org/cloudcode/guide/)
- [Parse JavaScript SDK](https://docs.parseplatform.org/js/guide/)
