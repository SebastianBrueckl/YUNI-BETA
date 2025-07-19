// script.js
import { app } from './firebase.js';
import {
  getDatabase,
  ref,
  get,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const db = getDatabase(app);

// Default values
const defaultSettings = {
  color: "blue",
  darkMode: false,
  username: "Gast"
};

// Farbwerte
const colorHexMap = {
  red: "#e57373",
  orange: "#ffb74d",
  yellow: "#fff176",
  green: "#81c784",
  blue: "#4a90e2",
  violet: "#ba68c8",
  pink: "#f48fb1",
  gray: "#90a4ae"
};

// Aktueller Benutzer (z. B. später durch Login ersetzen)
const userId = "defaultUser";

// 🔄 Nutzereinstellungen aus Firebase laden
async function loadUserSettings() {
  const settingsRef = ref(db, `users/${userId}/settings`);
  const snapshot = await get(settingsRef);
  return snapshot.exists() ? snapshot.val() : { ...defaultSettings };
}

// 🔃 Nutzereinstellungen in Firebase speichern
function saveUserSetting(key, value) {
  set(ref(db, `users/${userId}/settings/${key}`), value);
}

// 🎨 Farbe anwenden
function applyColor(color) {
  currentColor = color;
  document.documentElement.style.setProperty('--yuni-blue', colorHexMap[color] || colorHexMap.blue);
  updateIconsColor(color);
  saveUserSetting("color", color);
}

function updateIconsColor(color) {
  const suffix = "-" + color;
  const icons = {
    "nav-home": "index-icon",
    "nav-texts": "texts-icon",
    "nav-useractions": "heart-icon",
    "nav-questions": "question-icon",
    "nav-settings": "settings-icon"
  };
  for (let id in icons) {
    const el = document.getElementById(id);
    if (el) el.src = `icons/${icons[id]}${suffix}.png`;
  }
}

// 🌙 Darkmode
function applyDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  saveUserSetting("darkMode", enabled);
}

// 👤 Username aktualisieren
function updateUsername(name) {
  saveUserSetting("username", name);
  const display = document.getElementById("usernameDisplay");
  if (display) display.textContent = name;
}

// 🚀 Start
document.addEventListener("DOMContentLoaded", async () => {
  const settings = await loadUserSettings();

  applyColor(settings.color || defaultSettings.color);
  applyDarkMode(settings.darkMode === true);

  const darkToggle = document.getElementById("darkModeToggleMain");
  if (darkToggle) {
    darkToggle.checked = settings.darkMode;
    darkToggle.addEventListener("change", e => applyDarkMode(e.target.checked));
  }

  const profileToggle = document.getElementById("profileToggle");
  const profileMenu = document.getElementById("profileMenu");
  const usernameInput = document.getElementById("usernameInput");
  const usernameDisplay = document.getElementById("usernameDisplay");

  const username = settings.username || "Gast";
  if (usernameInput) usernameInput.value = username;
  if (usernameDisplay) usernameDisplay.textContent = username;

  if (profileToggle && profileMenu) {
    profileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const show = profileMenu.classList.toggle("show");
      profileMenu.setAttribute("aria-hidden", (!show).toString());
      if (show && usernameInput) usernameInput.focus();
    });

    document.addEventListener("click", () => {
      profileMenu.classList.remove("show");
      profileMenu.setAttribute("aria-hidden", "true");
    });

    profileMenu.addEventListener("click", e => e.stopPropagation());
  }

  if (usernameInput && usernameDisplay) {
    usernameInput.addEventListener("input", () => {
      const val = usernameInput.value.trim() || "Gast";
      updateUsername(val);
    });
  }

  // Optional: Update Profilbild-Symbol
  function updateProfileIcon() {
    const avatarImg = profileToggle?.querySelector("img.avatar");
    const navProfile = document.getElementById("nav-profile");
    if (avatarImg && navProfile) {
      navProfile.src = avatarImg.src;
    }
  }
  updateProfileIcon();
});
