function getStorage () {
  return chrome.storage.sync || chrome.storage.local
}

export function getItems(defaults, callback) {
  const storage = getStorage();
  const items = storage.get(defaults, callback);
  return items;
};

export function onChangeItems (callback) {
}

export function setItems (items, callback) {
  const storage = getStorage();
  storage.set(items, callback);
};