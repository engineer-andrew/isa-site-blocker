import convert from './convert.js'

const ipv4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
const ipv6 = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/
const localhost = /^localhost$/
const domain = /^.+\.[^.]+$/
const simpleDomain = /^[^.*]+\.[^.]+$/

export function compile (glob) {
  debugger;
  // if not a valid glob, ignore it
  if (!ipv4.test(glob) && !ipv6.test(glob) && !localhost.test(glob) && !domain.test(glob)) {
    return () => false;
  }

  let regexp = convert(glob);

  // allow all subdomains if none was specified
  if (simpleDomain.test(glob)) {
    regexp = `(.+\\.)?${regexp}`;
  }

  // force matching the entire input against the pattern
  regexp = new RegExp(`^${regexp}$`, 'i');

  return (url) => {
    const httpIndex = url.indexOf('http://');
    const httpsIndex = url.indexOf('https://');
    if (httpIndex === -1 && httpsIndex === -1) {
      return true;
    }

    let length = 7;
    if (httpsIndex > -1) {
      length = 8;
    }

    return regexp.test(url.slice(length));
  };
}
