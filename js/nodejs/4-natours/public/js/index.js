/* eslint-disable */
import '@babel/polyfill';
import { login, logOut } from './login';
import { displayMap } from './leaflet';
import { updateSettings } from './updateSettings';

// DOM elements
const leafletDiv = document.getElementById('map');
const logInForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const submitUserSettingsBtn = document.querySelector('.form-user-data button');
const passChangeForm = document.querySelector('.form-user-settings');
const changePasswdBtn = document.querySelector('.form-user-settings button');

// DELEGATION
if (leafletDiv) {
  const locations = JSON.parse(document.getElementById('map').dataset.locations);
  displayMap(locations);
}

if (logOutBtn) logOutBtn.addEventListener('click', logOut);

if (logInForm) {
  document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    // console.log('Byl klik');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (submitUserSettingsBtn) {
  submitUserSettingsBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // tworztmy programowo formularz
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    // updateSettings({ email, name }, 'data');
    updateSettings(form, 'data');
  });
}

if (passChangeForm) {
  passChangeForm.addEventListener('submit', async (e) => {
    changePasswdBtn.innerText = 'Trwa zmiana';
    e.preventDefault();
    const currentpassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      {
        currentpassword,
        password,
        passwordConfirm,
      },
      'password'
    );

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    changePasswdBtn.innerText = 'Save password';
  });
}
