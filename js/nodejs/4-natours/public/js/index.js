/* eslint-disable */
import '@babel/polyfill';
import { login, logOut } from './login';
import { displayMap } from './leaflet';

// DOM elements
const leafletDiv = document.getElementById('map');
const formElement = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

// DELEGATION
if (leafletDiv) {
  const locations = JSON.parse(document.getElementById('map').dataset.locations);
  displayMap(locations);
}

if (logOutBtn) logOutBtn.addEventListener('click', logOut);

if (formElement) {
  document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    // console.log('Byl klik');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
