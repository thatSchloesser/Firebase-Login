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



app.get('/', (req, res) => {
  console.log('in /')

  console.log('sent root');
  res.sendFile(
    path.join(__dirname, '../dist/index.html'),
  );
});


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
      Promise.reject(error);
    }).then((value) => {
      //INSERT INTO OUR DATABASE HERE

      console.log('value in chain', value)
    })


    

  res.sendStatus(200);
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
      // If the first part of the route is in the files array its
      // either a file or a folder, we try to send them the file in the
      // code below.

      const tempFilePath = path.join(
        __dirname, `../dist/${req.params['0']}`,
      ); // Set the file path

      // Check if file exists. If it does send the file, otherwise send
      // a 404 and console.log an error.
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
      // Otherwise route to React website.
      // COULD handle 404 NOT FOUND here... but easier to do with react-router
      res.sendFile(
        path.join(__dirname, '../dist/index.html'),
      ); // NOTE: this will send a request for bundle.js, which is handled above.
    }
  });
});

console.log('listening on port', process.env.PORT || 8080);
app.listen(process.env.PORT || 8080);




//verify account creation with: 
// firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
//   // Send token to your backend via HTTPS
//   // ...
// }).catch(function(error) {
//   // Handle error
// });