//server dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

//firebase admin
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-config.json');
const { verify } = require('crypto');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://blue-ocean-11c09.firebaseio.com',
});
const verifyUser = admin.auth().verifyIdToken;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//------------------------------

// middleware to check cookie
function checkCookieMiddleware(req, res, next) {
  console.log('in middleware');
  console.log(req);

  const sessionCookie = req.cookies.__session || '';

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then((decodedClaims) => {
      req.decodedClaims = decodedClaims;
      next();
    })
    .catch((error) => {
      console.log('NO COOKIE ERROR, REDIRECT');
      // Session cookie is unavailable or invalid. Force user to login.
      res.redirect('/');
    });
}

//------------------------------

//send homepage (could use express.static)
app.get('/', (req, res) => {
  console.log('in /');
  if (req.cookies.__session) {
    console.log('has cookie, redirecting to homepage');
    res.redirect('/routes/redirect');
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// this should only load when you are signed in
app.get('/routes/redirect', checkCookieMiddleware, (req, res) => {
  console.log('in routes redirect');
  let uid = req.decodedClaims.uid;
  res.sendFile(path.join(__dirname, '../dist/routes/redirect.html'));
});

//AUTH:
//CREATE USER:
app.post('/user', (req, res) => {
  console.log('in users post');
  // console.log(req.body)
  const idToken = req.body.idToken;
  // idToken comes from the client app
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      // let uid = decodedToken.uid;
      // console.log(decodedToken)
      console.log('--------------\nverified!');
      //******************************* */
      //INSERT INTO OUR DATABASE HERE
      //******************************* */
      return true;
    })
    .catch(function (error) {
      //user not verified error don't persist.
      console.log('error', error);
      // unhandled promise rejection warning
      //HANDLE THIS VIA RESOLVING OR SOMETHING. FIX WARNING>
      res.sendStatus(401);
      Promise.resolve(error);
    })
    .then(() => {
      console.log('successfully saved: ');
    });
});

//set user cookie if token has been sent in firebase
app.post('/cookie', (req, res) => {
  const idToken = req.body.idToken;
  console.log('in cookie\n', idToken);

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedUser) => {
      return admin.auth().createSessionCookie(idToken, { expiresIn });
    })
    .then((sessionCookie) => {
      // Set cookie policy for session cookie and set in response.
      const options = { maxAge: expiresIn, httpOnly: true, secure: false };
      res.cookie('__session', sessionCookie, options); //verify later
      res.end(JSON.stringify({ status: 'success' }));

      //unnecessary:
      // admin.auth().verifyIdToken(idToken).then(function(decodedClaims) {
      //   res.redirect('/newPage');
      // });
    })
    .catch((error) => {
      console.log(error);
      res.status(401).send('UNAUTHORIZED REQUEST!');
    });
});

// return file that corresponds with route
app.get('*', (req, res) => {
  const route = req.params['0'].split('/')[1];
  console.log('route:', route);

  fs.readdir(path.join(__dirname, '../dist'), (err, files) => {
    //THIS BREAKS ON NESTED FILES

    if (err) throw err;
    const fileArray = files.filter((file) => file !== 'index.html');

    if (fileArray.includes(route)) {
      const tempFilePath = path.join(__dirname, `../dist/${req.params['0']}`); // Set the file path

      // Check if file exists.
      fs.access(tempFilePath, fs.F_OK, (fsErr) => {
        if (fsErr) {
          console.error(fsErr);
          res.statusCode = 404;
          res.end('Not Found');
        } else {
          res.sendFile(tempFilePath);
        }
      });
    } else {
      console.log('in file else ');
      //note: if extension is included in route, it probably will not hit this point.
      res.redirect('/');
    }
  });
});

console.log('listening on port', process.env.PORT || 8080);
app.listen(process.env.PORT || 8080);
