require('dotenv').config();

const express = require('express');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const path = require('path');
const history = require('connect-history-api-fallback');
const crypto = require('crypto');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
let REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:8888/callback';
let FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:3000';
const PORT = process.env.PORT || 8888;

if (process.env.NODE_ENV !== 'production') {
  REDIRECT_URI = 'http://localhost:8888/callback';
  FRONTEND_URI = 'http://localhost:3000';
}

const app = express();
const stateKey = 'spotify_auth_state';

// Generate a random string containing numbers and letters
const generateRandomString = (length) => {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => possible[x % possible.length])
    .join('');
};

app.use(express.static(path.resolve(__dirname, '../client/build')));

app
  .use(express.static(path.resolve(__dirname, '../client/build')))
  .use(cors())
  .use(cookieParser())
  .use(
    history({
      verbose: true,
      rewrites: [
        { from: /\/login/, to: '/login' },
        { from: /\/callback/, to: '/callback' },
        { from: /\/refresh_token/, to: '/refresh_token' },
      ],
    })
  )
  .use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

app.get('/login', function (req, res) {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    const scope =
      'user-read-private user-read-email user-read-recently-played user-top-read user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public';
  
    res.redirect(
      `https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope,
        redirect_uri: REDIRECT_URI,
        state,
      })}`
    );
  });
  

app.get('/callback', function (req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState =
    req.cookies && req.cookies[stateKey] ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(`/#${querystring.stringify({ error: 'state_mismatch' })}`);
    return;
  }

  res.clearCookie(stateKey);

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    json: true,
  };
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
    const { access_token, refresh_token } = body;
    res.redirect(
        `${FRONTEND_URI}/#${querystring.stringify({
          access_token,
          refresh_token,
        })}`
      );
    } else {
      res.redirect(`/#${querystring.stringify({ error: 'invalid_token' })}`);
    }
});
});

app.get('/refresh_token', function (req, res) {
const { refresh_token } = req.query;
const authOptions = {
url: 'https://accounts.spotify.com/api/token',
headers: {
Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
},
form: {
grant_type: 'refresh_token',
refresh_token,
},
json: true,
};

request.post(authOptions, function (error, response, body) {
if (!error && response.statusCode === 200) {
const { access_token } = body;
res.send({ access_token });
} else {
res.sendStatus(400);
}
});
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
