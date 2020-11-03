console.log('hi');

logout = function () {
  axios.post('/logout').then(() => {
    location.href = '/';
  });
  console.log('logout');
};
