function isGlobMetaCharacter (ch) {
  return '*?[]'.indexOf(ch) >= 0;
}

function isRegExpMetaCharacter (ch) {
  return '\\^$.*+?()[]{}|'.indexOf(ch) >= 0;
}

const ipv4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
const ipv6 = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/;
const localhost = /^localhost$/;
const domain = /^.+\.[^.]+$/;
const simpleDomain = /^[^.*]+\.[^.]+$/;

const compile = (glob) => {
  // if not a valid glob, ignore it
  if (!ipv4.test(glob) && !ipv6.test(glob) && !localhost.test(glob) && !domain.test(glob)) {
    return false;
  }

  let regexp = convert(glob);

  // allow all subdomains if none was specified
  if (simpleDomain.test(glob)) {
    regexp = `(.+\\.)?${regexp}`;
  }

  // force matching the entire input against the pattern
  regexp = new RegExp(`^${regexp}$`, 'i');

  return (url) => {
    // const {protocol, hostname} = url;
    // return (protocol !== 'http:' && protocol !== 'https:') || regexp.test(hostname);
    return regexp.test(url);
  };
};

const convert = (pattern, options = {}) => {
  const {starCannotMatchZero, questionCanMatchZero} = options;

  let buffer = '';
  let inCharSet = false;

  for (let i = 0, l = pattern.length; i < l; ++i) {
    switch (pattern[i]) {
      case '*':
        if (inCharSet) {
          buffer += '*';
        } else {
          buffer += starCannotMatchZero ? '.+' : '.*';
        }
        break;
      case '?':
        if (inCharSet) {
          buffer += '?';
        } else {
          buffer += questionCanMatchZero ? '.?' : '.';
        }
        break;
      case '[':
        inCharSet = true;
        buffer += pattern[i];
        if (i + 1 < l) {
          switch (pattern[i + 1]) {
            case '!':
            case '^':
              buffer += '^';
              ++i;
              continue;
            case ']':
              buffer += ']';
              ++i;
              continue;
          }
        }
        break;
      case ']':
        inCharSet = false;
        buffer += pattern[i];
        break;
      case '\\':
        buffer += '\\';
        if (i === l - 1) {
          buffer += '\\';
        } else if (isGlobMetaCharacter(pattern[i + 1])) {
          buffer += pattern[++i];
        } else {
          buffer += '\\';
        }
        break;
      default:
        if (!inCharSet && isRegExpMetaCharacter(pattern[i])) {
          buffer += '\\';
        }
        buffer += pattern[i];
    }
  }

  return buffer;
}

const defaults = {
  blockPages: true,
  blockOthers: true,
  whitelist: ['bing.*', 'google.*', 'paypal.me', 'wikimedia.org', 'wikipedia.org']
};

const getSettings = () => {
  const storage = window.chrome.storage.sync || window.chrome.storage.local;
  storage.get(defaults, callback);
};

const init = () => {
  // 2. when the event is fired (which will only happen once, when the window is loaded), intercept the request and check to see if it's allowed to go through
  const urls = ['<all_urls>'];
  window.chrome.webRequest.onBeforeRequest.addListener(redirect, {urls}, ['blocking']);

  // 2b. when the event is fired (which will only happen once, when the window is loaded), watch/listen for changes to the settings and reload everything if they do change
  window.chrome.storage.onChanged.addListener(reload);

  // 2c. when the event is fired (which will only happen once, when the window is loaded), load the settings for the first time
  reload();
};


const defaultSettings = () => {
  return defaults;
};

const getItems = (defaults, callback) => {
  const storage = getStorage();
  storage.get(defaults, callback);
};

const getStorage = () => {
  return window.chrome.storage.sync || window.chrome.storage.local;
};

const loadSettings = (callback) => {
  getItems(defaultSettings(), callback);
};

function getExtensionUrl () {
  return window.chrome.extension.getURL.apply(window.chrome.extension, arguments);
};

function updateTab (id, url) {
  url = getExtensionUrl(url);

  window.chrome.tabs.update(id, {url});
  settings.whitelist.push(compile(url));
}

const redirect = (details) => {
  const {tabId, type, url} = details;

  if (type === 'main_frame') {
    // TODO: this requires importing the url library (https://github.com/defunctzombie/node-url/blob/master/url.js)
    const parsed = parse(url);
    // TODO: this won't work until parsed is created
    const match = settings.whitelist.find((entry) => entry(parsed));

    if (!match) {
      // TODO: this will just hang the page until the blocked.html is added to the whitelist
      updateTab(tabId, `blocked.html`);
    }
  }
};

const reload = () => {
  loadSettings(({blockPages, blockOthers, whitelist}) => {
    settings.blockPages = blockPages;
    settings.blockOthers = blockOthers;
    settings.whitelist = whitelist.map(compile);
  });
};

const settings = {};

// 1. add an event listener to window.load
window.addEventListener('load', init, true);