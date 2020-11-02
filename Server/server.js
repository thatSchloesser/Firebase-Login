//server dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');


//firebase admin 
var admin = require("firebase-admin");
var serviceAccount = require("./firebase-admin-config.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://blue-ocean-11c09.firebaseio.com"
});


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//send homepage (could use express.static)
app.get('/', (req, res) => {
  console.log('in /')
  console.log(req)

  console.log('sent root');
  res.sendFile(
    path.join(__dirname, '../dist/index.html'),
  );
});

//redirect test
// app.get('/routes/redirect.html', (req, res) => {
//   console.log('in redirect')
//   res.redirect(301, '/');
// });

//AUTH:
//CREATE USER: 
app.post('/user', (req, res) => {
  console.log('in users post')
  console.log(req.body)
  const idToken = req.body.idToken;

  // idToken comes from the client app
  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      // let uid = decodedToken.uid;
      // // ...
      console.log('--------------\nverified!');
      console.log(decodedToken)
      return true;
    }).catch(function(error) {
      //user not verified error don't persist.
      console.log('error', error)

      // unhandled promise rejection warning
        //HANDLE THIS VIA RESOLVING OR SOMETHING. FIX WARNING> 
      Promise.reject(error);
    }).then((value) => {
      //INSERT INTO OUR DATABASE HERE

      console.log('value in chain', value)
      res.redirect(301, '/routes/redirect.html');
      console.log('redirected?')
    })



});

// quick wildcard optimzation:
// app.get('*', (req, res) => {
//   res.status(200).send('404 not found');
// });

// return file that corresponds with route
app.get('*', (req, res) => {
  const route = req.params['0'].split('/')[1];
  console.log('route:', route);

  fs.readdir(path.join(__dirname, '../dist'), (err, files) => {
    if (err) throw err;
    const fileArray = files.filter((file) => file !== 'index.html');

    if (fileArray.includes(route)) {

      const tempFilePath = path.join(
        __dirname, `../dist/${req.params['0']}`,
      ); // Set the file path

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
      res.sendFile(
        path.join(__dirname, '../dist/index.html'),
      );
    }
  });
});



//verify account creation with: 
// firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
//   // Send token to your backend via HTTPS
//   // ...
// }).catch(function(error) {
//   // Handle error
// });




//TODO: serve site based on login. 

  //IF LOGGED IN: 
    //serve login

  //IF NOT LOGGED IN
    //literally just redirect. 
  
  //-> how do I efficiently set this up site-wide?




//put in separate file?
  //just use req.setCookie or something

function setCookie(idToken, res) {
  // Set session expiration to 5 days.
  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
    
    // Set cookie policy for session cookie and set in response.
    const options = {maxAge: expiresIn, httpOnly: true, secure: true};
    res.cookie('__session', sessionCookie, options);
    
    admin.auth().verifyIdToken(idToken).then(function(decodedClaims) {
      res.redirect('/newPage');
    });
      
  }, error => {
    res.status(401).send('UNAUTHORIZED REQUEST!');
  });
}

















console.log('listening on port', process.env.PORT || 8080);
app.listen(process.env.PORT || 8080);