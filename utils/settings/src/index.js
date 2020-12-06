import { getItems, setItems } from "../../../storage.js";

const defaults = {
  blockPages: false,
  blockOthers: false,
  password: null,
  usePassword: false,
  whitelist: ['bing.*', 'google.*', 'paypal.me', 'wikimedia.org', 'wikipedia.org']
}

export function defaultSettings () {
  return defaults;
}

export function loadSettings(callback) {
  getItems(defaultSettings(), callback);
}

export function saveSettings(settings, callback) {
  setItems(settings, callback);
}
