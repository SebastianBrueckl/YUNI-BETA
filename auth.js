// auth.js

// Firebase Modular SDK über CDN
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

import { app } from './firebase.js';

const auth = getAuth(app);
const storage = getStorage(app);

// DOM-Elemente
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const messageDiv = document.getElementById('message');

// Formularwechsel Login/Register
showRegister.addEventListener('click', e => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  messageDiv.textContent = '';
});

showLogin.addEventListener('click', e => {
  e.preventDefault();
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  messageDiv.textContent = '';
});

// Hilfsfunktion für Nachrichten
function showMessage(msg, isError = true) {
  messageDiv.style.color = isError ? 'red' : 'green';
  messageDiv.textContent = msg;
}

// Avatar-Upload
async function uploadAvatar(file, userId) {
  if (!file) return null;

  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Avatar darf max. 2MB groß sein.');
  }

  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
    throw new Error('Nur JPG oder PNG erlaubt.');
  }

  const avatarRef = ref(storage, `avatars/${userId}/${file.name}`);
  await uploadBytes(avatarRef, file);
  const url = await getDownloadURL(avatarRef);
  return url;
}

// Registrierung
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  messageDiv.textContent = '';

  const alias = document.getElementById('regAlias').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const avatarFile = document.getElementById('regAvatar').files[0];

  if (alias.length < 3 || alias.length > 20) {
    showMessage('Alias muss zwischen 3 und 20 Zeichen lang sein.');
    return;
  }
  if (password.length < 6) {
    showMessage('Passwort muss mindestens 6 Zeichen lang sein.');
    return;
  }

  const fakeEmail = `${alias.toLowerCase()}@yuni.local`;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
    const user = userCredential.user;

    let photoURL = null;
    if (avatarFile) {
      photoURL = await uploadAvatar(avatarFile, user.uid);
    }

    await updateProfile(user, {
      displayName: alias,
      photoURL: photoURL || null,
    });

    showMessage('Registrierung erfolgreich! Du bist jetzt angemeldet.', false);
    setTimeout(() => {
      window.location.href = 'for-you.html';
    }, 1500);

  } catch (error) {
    let msg = error.message;
    if (msg.includes('auth/email-already-in-use')) {
      msg = 'Alias existiert bereits. Bitte wähle einen anderen.';
    } else if (msg.includes('auth/weak-password')) {
      msg = 'Das Passwort ist zu schwach.';
    }
    showMessage(msg);
  }
});

// Login
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  messageDiv.textContent = '';

  const alias = document.getElementById('loginAlias').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (alias.length < 3 || alias.length > 20) {
    showMessage('Alias muss zwischen 3 und 20 Zeichen lang sein.');
    return;
  }
  if (password.length < 6) {
    showMessage('Passwort muss mindestens 6 Zeichen lang sein.');
    return;
  }

  const fakeEmail = `${alias.toLowerCase()}@yuni.local`;

  try {
    await signInWithEmailAndPassword(auth, fakeEmail, password);
    showMessage('Erfolgreich eingeloggt!', false);
    setTimeout(() => {
      window.location.href = 'for-you.html';
    }, 1000);

  } catch (error) {
    let msg = error.message;
    if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
      msg = 'Alias oder Passwort falsch.';
    }
    showMessage(msg);
  }
});

// Automatische Weiterleitung bei Login-Status
onAuthStateChanged(auth, user => {
  if (user) {
    if (!window.location.href.includes('auth.html')) {
      return;
    }
    window.location.href = 'for-you.html';
  }
});
