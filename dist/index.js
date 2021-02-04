(function () {
  // console.log('hi from script');
  // console.log('cookies:', document.cookie);

  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: 'AIzaSyDgQ_XKve5qbqGrBzIJUz68jZq1jdfc9wE',
    authDomain: 'blue-ocean-11c09.firebaseapp.com',
    databaseURL: 'https://blue-ocean-11c09.firebaseio.com',
    projectId: 'blue-ocean-11c09',
    storageBucket: 'blue-ocean-11c09.appspot.com',
    messagingSenderId: '1021824389353',
    appId: '1:1021824389353:web:1bcb46d710c7dd9c9b6078',
    measurementId: 'G-3XVR2PNR58',
  };

  firebase.initializeApp(firebaseConfig);
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

  if (true) {
    console.log('logged in?', firebase.auth().currentUser);
  }

  var uiConfig = {
    callbacks: {
      // This method runs upon a successful login
      signInSuccessWithAuthResult: function (authResult) {
        console.log('auth result', JSON.stringify(authResult));
        let idToken = null;
        let userInfo = authResult.additionalUserInfo;

        firebase
          .auth()
          .currentUser.getIdToken(true)
          .then((id) => {
            //NOTE: THIS TOKEN DOES NOT EXIST IN THE 'authResult' object
            idToken = id;
            console.log('idToken', id);
            return axios.post('/cookie', { idToken });
          })
          .then((cookie) => {
            const newUser = userInfo.isNewUser;
            if (newUser) {
              console.log('new user!');
              const body = {
                idToken: idToken,
                profile: userInfo.profile,
              };
              return axios.post('/user', body);
            } else {
              console.log('not new user');
            }
          })
          .then(() => {
            location.href = '/routes/redirect';
            console.log('routed');
          })
          .catch(function (error) {
            console.log('LOGIN FLOW ERROR', error);
          });
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle. (developer handles on false)
        return false;
      },
      uiShown: function () {
        // The widget is rendered.
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
      },
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    // signInSuccessUrl: '/routes/redirect',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
  }; //end ui config

  //start auth
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  ui.start('#firebaseui-auth-container', uiConfig);

  // firebase.auth().onAuthStateChanged(function (user) {
  //   console.log('AUTH STATE CHANGE');
  // });
})();
