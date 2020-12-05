import { getItems, onChangeItems, setItems } from "../../../storage.js";

const defaults = {
  blockPages: false,
  blockOthers: false,
  whitelist: ['bing.*', 'google.*', 'paypal.me', 'wikimedia.org', 'wikipedia.org']
}

export function defaultSettings () {
  return defaults;
}

export function loadSettings(callback) {
  getItems(defaultSettings(), callback);
}

export function onChangeSettings (callback) {
  onChangeItems(callback);
}

export function saveSettings (settings, callback) {
  setItems(settings, callback);
}
