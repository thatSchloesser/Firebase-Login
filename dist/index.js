// import * as firebase from 'firebase';
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult) {
      console.log(authResult)
      console.log(JSON.stringify(authResult))

      
      
      const newUser = authResult.additionalUserInfo.isNewUser
      if ( newUser ) {
        console.log( 'new user!')
        
        firebase.auth().currentUser.getIdToken(true).then((idToken) => {
            // Send token to your backend via HTTPS
            // ...
            console.log('ID TOKEN', idToken);
        
            const body = {
              idToken: idToken,
              profile: authResult.additionalUserInfo.profile
            }
            return axios.post('/user', body);

          }).then(()=>{
            console.log('posted user!')
          })
          .catch(function(error) {
            // Handle error
          });
        //make ajax request here

        console.log(JSON.stringify(body));
      } else {
        console.log('not new user')
      }
      
      //pass authentication.idToken
      //pass other data that I want to post method

      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  // signInSuccessUrl: '/routes/redirect.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ]
};
//test
axios.get('/')

var testConfig = {
  signInOptions: [
    // List of OAuth providers supported.
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ]
}


(function(){
  
  console.log('hi from script')
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDgQ_XKve5qbqGrBzIJUz68jZq1jdfc9wE",
    authDomain: "blue-ocean-11c09.firebaseapp.com",
    databaseURL: "https://blue-ocean-11c09.firebaseio.com",
    projectId: "blue-ocean-11c09",
    storageBucket: "blue-ocean-11c09.appspot.com",
    messagingSenderId: "1021824389353",
    appId: "1:1021824389353:web:1bcb46d710c7dd9c9b6078",
    measurementId: "G-3XVR2PNR58"
  };

  firebase.initializeApp(firebaseConfig);

  
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  


  ui.start('#firebaseui-auth-container', uiConfig);

  console.log(firebase.auth())
}())


firebase.auth().onAuthStateChanged(function(user) {
  console.log(user);
});

// var firebase = require('firebase');
// var firebaseui = require('firebaseui');
// const { config } = require('process');



  // var uiConfig = {
  //   callbacks: {
  //     signInSuccessWithAuthResult: function(authResult, redirectUrl) {
  //       // User successfully signed in.
  //       // Return type determines whether we continue the redirect automatically
  //       // or whether we leave that to developer to handle.
  //       return true;
  //     },
  //     uiShown: function() {
  //       // The widget is rendered.
  //       // Hide the loader.
  //       document.getElementById('loader').style.display = 'none';
  //     }
  //   },
  //   // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  //   signInFlow: 'popup',
  //   signInSuccessUrl: 'firebase.stephen.fun',
  //   signInOptions: [
  //     // Leave the lines as is for the providers you want to offer your users.
  //     firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  //   ],
  //   // Terms of service url.
  //   tosUrl: 'termsofservice.html',
  //   // Privacy policy url.
  //   privacyPolicyUrl: 'privacypolicy.html'
  // };

  // ui.start('#firebaseui-auth-container', uiConfig);


  //okay now I just need to serve data if not logged in.