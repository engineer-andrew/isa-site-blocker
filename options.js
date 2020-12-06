import { loadSettings, saveSettings } from './utils/settings/index.js';

const init = () => {
  loadSettings(settings => {
    document.getElementById('app-options-block-pages').checked = settings.blockPages;
    document.getElementById('app-options-block-others').checked = settings.blockOthers;
    document.getElementById('app-options-password').checked = settings.usePassword;
    document.getElementById('app-options-whitelist').value = settings.whitelist.join('\n');

    if (!!settings.usePassword) {
      // the options are password protected so show the password input
      document.getElementById('app-password').style.display = 'flex';
    } else {
      // the options are not password protected so show them
      document.getElementById('app-options').style.display = 'flex';
    }
  });
};

window.addEventListener('load', init, true);

document.getElementById('app-password-form').addEventListener('submit', (evt) => {
  evt.preventDefault();
  document.getElementById('app-password-input-error').style.display = 'none';
  loadSettings(settings => {
    // get the value the user entered
    const value = document.getElementById('app-password-input').value;
    // get the current password
    if (!settings.password || settings.password === value) {
      // show the password (it'll show up as dots or asterisks because the type is password)
      document.getElementById('app-options-password-input').value = settings.password;
      document.getElementById('app-options-password-input').style.display = 'block';
      // show the options
      document.getElementById('app-options').style.display = 'flex';
      // hide the password input
      document.getElementById('app-password').style.display = 'none';
    } else {
      document.getElementById('app-password-input-error').style.display = 'inline';
    }
  });
});

// wire up the event listener for the checkbox to specify whether the options should be password protected
document.getElementById('app-options-password').addEventListener('change', (evt) => {
  // show the input for the user to enter their password when they've opted to password protect the options
  document.getElementById('app-options-password-input').style.display = !!evt.target.checked ? 'block' : 'none';
});

// wire up the event listener for the save changes button
document.getElementById('app-options-form').addEventListener('submit', (evt) => {
  evt.preventDefault();
  // save the checkbox options, the whitelist, and the password settings to storage
  const blockPages = document.getElementById('app-options-block-pages').checked;
  const blockOthers = document.getElementById('app-options-block-others').checked;
  const usePassword = document.getElementById('app-options-password').checked;
  const whitelist = document.getElementById('app-options-whitelist').value.split('\n');
  let password;
  if (!!usePassword) {
    password = document.getElementById('app-options-password-input').value;
  }

  saveSettings({blockPages, blockOthers, password, usePassword, whitelist});

  document.getElementById('app-options-saved-message').style.display = 'inline';
  setTimeout(() => {
    document.getElementById('app-options-saved-message').style.display = 'none';
  }, 3000);
});