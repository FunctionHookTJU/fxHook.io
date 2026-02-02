# Comments API Blueprint

## Endpoint Contract

### `GET /api/comments`
- Returns an array (or `{ "data": [] }`) of comment objects.
- Each object should include at least:
  - `id` (string, unique identifier)
  - `name` (string, nullable)
  - `message` (string)
  - `createdAt` (ISO 8601 timestamp)

Example:
```json
[
  {
    "id": "cmmt_01",
    "name": "访客",
    "message": "很喜欢这个站！",
    "createdAt": "2024-06-18T09:45:12.000Z"
  }
]
```

### `POST /api/comments`
- Accepts JSON payload: `{ "name": string, "message": string }`.
- Performs basic validation and rate limiting server-side.
- Responds with the newly created comment object (same shape as above).

Validation ideas:
- Trim strings, ensure `0 < name.length <= 24`, `0 < message.length <= 500`.
- Sanitize HTML tags before storing.

## Minimal Edge/Server Implementation (Node + Express)

```js
import express from 'express';
import { nanoid } from 'nanoid';

const app = express();
app.use(express.json());

const comments = []; // Replace with database or KV store

app.get('/api/comments', (req, res) => {
  res.json(comments);
});

app.post('/api/comments', (req, res) => {
  const name = (req.body.name || '').trim().slice(0, 24);
  const message = (req.body.message || '').trim();

  if (!name || !message || message.length > 500) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const entry = {
    id: nanoid(),
    name,
    message,
    createdAt: new Date().toISOString()
  };

  comments.push(entry);
  res.status(201).json(entry);
});

app.listen(3000, () => console.log('Comments API running')); // eslint-disable-line no-console
```

Deploy the handler on your preferred platform (Cloudflare Workers, Vercel Edge, Fly.io, self-hosted, etc.) and point the front-end section attribute `data-endpoint` to the deployed URL (for same-origin deployments, `/api/comments` already works).
