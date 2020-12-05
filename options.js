import { loadSettings, saveSettings } from './utils/settings/index.js';

const init = () => {
  loadSettings((loadedSettings) => {
    document.getElementById('app-options-block-pages').checked = loadedSettings.blockPages;
    document.getElementById('app-options-block-others').checked = loadedSettings.blockOthers;
    document.getElementById('app-options-whitelist').value = loadedSettings.whitelist.join('\n');
  });
};

window.addEventListener('load', init, true);
document.getElementById('app-options-block-pages').addEventListener('change', (evt) => {
  const save = {blockPages: evt.target.checked};
  saveSettings(save);
});

document.getElementById('app-options-block-others').addEventListener('change', (evt) => {
  const save = {blockOthers: evt.target.checked};
  saveSettings(save);
});

document.getElementById('app-options-whitelist').addEventListener('change', (evt) => {
  const value = evt.target.value;
  const whitelist = value.split('\n');
  saveSettings({whitelist});
});
