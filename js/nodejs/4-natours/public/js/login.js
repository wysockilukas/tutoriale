/* eslint-disable */

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    // console.log(res.data);
    if ((res.data.status = 'success')) {
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    console.log(error.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Byl klik');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
