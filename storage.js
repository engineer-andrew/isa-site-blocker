function getStorage () {
  return chrome.storage.sync || chrome.storage.local
}

export function getItems(defaults, callback) {
  const storage = getStorage();
  if (!callback) {
    callback = () => {};
  }
  const items = storage.get(defaults, callback);
  return items;
};

export function setItems(items, callback) {
  const storage = getStorage();
  if (!callback) {
    callback = () => {};
  }
  storage.set(items, callback);
};