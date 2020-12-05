import { loadSettings } from './utils/settings/index.js';
import { compile } from './utils/glob/index.js';

const settings = {};

function getExtensionUrl() {
  return window.chrome.extension.getURL.apply(window.chrome.extension, arguments);
}

const checkIfUrlIsWhitelisted = (details) => {
  const {tabId, type, url} = details;
  const blockPages = settings.blockPages && type === 'main_frame'
  const blockOthers = settings.blockOthers && type !== 'main_frame'

  if (!!blockPages || !!blockOthers) {
    const match = settings.whitelist.find((entry) => entry(url));

    if (!match) {
      if (blockPages) {
        redirect(tabId, 'isa-site-blocker-blocked.html');
      }

      if (!!blockPages || !!blockOthers) {
        return {cancel: true};
      }
    }
  }
};

const init = () => {
  // 2. when the event is fired (which will only happen once, when the window is loaded), intercept the request and check to see if it's allowed to go through
  const urls = ['<all_urls>'];
  window.chrome.webRequest.onBeforeRequest.addListener(checkIfUrlIsWhitelisted, {urls}, ['blocking']);

  // 2b. when the event is fired (which will only happen once, when the window is loaded), watch/listen for changes to the settings and reload everything if they do change
  chrome.storage.onChanged.addListener(reload);

  // 2c. when the event is fired (which will only happen once, when the window is loaded), load the settings for the first time
  reload();
};

const redirect = (tabId, url) => {
  url = getExtensionUrl(url);

  window.chrome.tabs.update(tabId, {url});
};

const reload = () => {
  loadSettings(({blockPages, blockOthers, whitelist}) => {
    settings.blockPages = blockPages;
    settings.blockOthers = blockOthers;
    // map the string whitelist options to regex patterns so they can be evaluated later
    settings.whitelist = whitelist.map(compile);
  });
};

// 1. add an event listener to window.load
window.addEventListener('load', init, true);
