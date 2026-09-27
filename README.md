# Family Circle — Backend

Yeh chhota Node/Express server hai jo `window.storage` (jo sirf Claude Artifacts
me kaam karta hai) ki jagah leta hai. Data ek simple `db.json` file me store
hota hai — koi separate database setup ki zaroorat nahi.

## Local test karne ke liye

```
cd family-circle-backend
npm install
npm start
```

Server `http://localhost:3000` pe chalega. Test karo:

```
curl http://localhost:3000/health
```

`{"ok":true}` aana chahiye.

## Deploy kaise karo (free options)

Netlify sirf static files serve karta hai, Node server nahi chala sakta —
isliye backend ko alag jagah deploy karna padega. Do aasan free options:

### Option A: Render.com
1. https://render.com pe account banao (GitHub se sign in kar sakte ho)
2. Is `family-circle-backend` folder ko ek GitHub repo me push karo
3. Render dashboard me "New +" → "Web Service" → apna repo select karo
4. Build command: `npm install`
5. Start command: `npm start`
6. Deploy karo — kuch minute me ek URL milega jaise
   `https://family-circle-backend.onrender.com`

Note: Render ke free tier pe agar 15 min tak koi request nahi aati toh server
so jata hai aur agli request pe ~30-50 sec me wake hota hai. Family app ke
liye yeh usually theek hai.

### Option B: Railway.app
1. https://railway.app pe account banao
2. "New Project" → "Deploy from GitHub repo" → yeh folder select karo
3. Railway khud detect kar lega ki yeh Node app hai, deploy ho jayega
4. Settings me se public URL copy karo

## Backend URL frontend me daalna

Deploy hone ke baad jo URL milega (jaise `https://xxxx.onrender.com`), usse
`index.html` ke top me is line me daalo:

```js
const API_BASE = 'https://xxxx.onrender.com/api';
```

Phir `index.html` ko dobara Netlify pe upload/deploy karo.

## Important: data persistence

`db.json` file server ke disk pe store hoti hai. Render/Railway ke free tier
pe agar server restart/redeploy hota hai, disk kabhi reset ho sakti hai
(platform-dependent). Family jaise chhote use-case ke liye yeh fine hai, lekin
agar data permanently chahiye toh future me isse Postgres/SQLite ke saath
persistent volume pe move kar sakte ho.
