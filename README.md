# CATVORA Technology website (MERN)

## Run locally
1. `cd server && cp .env.example .env` (fill MONGO_URI, JWT_SECRET, ADMIN_*), then `npm i && npm run seed && npm run dev`
2. `cd client && cp .env.example .env && npm i && npm run dev`
3. Site: http://localhost:5173  Admin: http://localhost:5173/admin

## Before launch
- Edit `client/src/config.js` (WhatsApp, Instagram, phone, email, address, map).
- Add GA4 and Meta Pixel snippets to `client/index.html`.
- Deploy: client to Vercel/Netlify (set VITE_API_URL), server to Render/Railway (NODE_ENV=production, CLIENT_URL=your site URL), DB on MongoDB Atlas.
