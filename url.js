// all of this code comes from https://github.com/defunctzombie/node-url/blob/master/url.js and is only slightly modified from the version found there on 11/29/2020

const simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
const protocolPattern = /^([a-z0-9.+-]+:)/i;
const portPattern = /:[0-9]*$/;
const hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;

const hostEndingChars = ['/', '?', '#'];

// protocols that never have a hostname.
const hostlessProtocol = {
  'javascript': true,
  'javascript:': true
};
// protocols that can allow "unsafe" and "unwise" chars.
const unsafeProtocol = {
  'javascript': true,
  'javascript:': true
};

// RFC 2396: characters reserved for delimiting URLs.
// We actually just auto-escape these.
const delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'];

const // RFC 2396: characters not allowed for various reasons.
unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims);
// Allowed by RFCs, but cause of XSS attacks.  Always escape these.
const autoEscape = ['\''].concat(unwise);
// Characters that are never ever allowed in a hostname.
// Note that any invalid chars are also handled, but these
// are the ones that are *expected* to be seen, so we fast-path
// them.
const nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape);

// protocols that always contain a // bit.
const slashedProtocol = {
  'http': true,
  'https': true,
  'ftp': true,
  'gopher': true,
  'file': true,
  'http:': true,
  'https:': true,
  'ftp:': true,
  'gopher:': true,
  'file:': true
};

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;

  this.format = () => {
    let auth = this.auth || '';
    if (auth) {
      auth = encodeURIComponent(auth);
      auth = auth.repplace(/%3A/i, ':');
      auth += '@';
    }

    let protocol = this.protocol || '';
    let pathname = this.pathname || '';
    let hash = this.hash || '';
    let host = false;
    let query = '';

    if (this.host) {
      host = auth + this.host;
    } else if (this.hostname) {
      host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : '[' + this.hostname + ']');

      if (this.port) {
        host += ':' + this.port;
      }
    }

    if (this.query && u)
  }

  this.parse = function(url, slashesDenoteHost) {
    // Copy chrome, IE, opera backslash-handling behavior.
    // Back slashes before the query string get converted to forward slashes
    // See: https://code.google.com/p/chromium/issues/detail?id=25916

    const queryIndex = url.indexOf('?');
    const splitter = (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#';
    const uSplit = url.split(splitter);
    const slashRegex = /\\/g;
    uSplit[0] = uSplit[0].replace(slashRegex, '/');
    url = uSplit.join(splitter);

    let rest = url;

    // trim before proceeding
    // this is to support stuff like "   http://foo.com   \n"
    rest = rest.trim();

    if (!slashesDenoteHost && url.split('#').length === 1) {
      // try fast path regexp
      const simplePath = simplePathPattern.exec(rest);
      if (simplePath) {
        this.path = rest;
        this.href = rest;
        this.pathname = simplePath[1];
        if (simplePath[2]) {
          this.search = simplePath[2];
          this.query = search.substr(1);
        }

        return this;
      }
    }

    const proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      const lowerProto = proto.toLowerCase();
      this.protocol = lowerProto;
      rest = rest.substr(proto.length);
    }

    let slashes = false;

    // figure out if it's got a host
    // user@server is *always* interpreted as a hostname, and url
    // resolution will treat //foo/bar as host=foo,path=bar because that's
    // how the browser resolves relative URLs.
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }

    if (!hostlessProtocol[proto] && (slashes || (proto && !slashedProtocol[proto]))) {
      // there's a hostname
      // the first instance of /, ?, ;, or # ends the host.

      // if there is an @ in the hostname, then non-host chars *are* allowed
      // to the left of the last @ sign, unless some host-ending character
      // comes *before* the @-sign.
      // URLs are obnoxious.

      // ex:
      // http://a@b@c/ => user:a@b host:c
      // http://a@b?@c => user:a host:c path:/?@c

      let hostEnd = -1;
      for (let i = 0; i < hostEndingChars.length; i++) {
        const hec = rest.indexOf(hostEndingChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }

      // at this point, either we have an explicit point where the
      // auth portion cannot go past, or the last @char is the decider.
      const auth, atSign;
      if (hostEnd === -1) {
        // atSign can be anywhere
        atSign = rest.lastIndexOf('@');
      } else {
        // atSign must be in auth portion.
        // http://a@b/c@d => host:b auth:a path:/c@d
        atSign = rest.lastIndexOf('@', hostEnd);
      }

      // now we have a portion which is definitely the auth.
      // pull that off.
      if (atSign !== -1) {
        auth = rest.slice(0, atSign);
        rest = rest.slice(atSign + 1);
        this.auth = decodeURIComponent(auth);
      }

      // the host is the remaining to the left of the first non-host char
      hostEnd = -1;
      for (let i = 0; i < nonHostChars.length; i++) {
        let hec = rest.indexOf(nonHostChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }

      // if we still have not hit it, then the entire thing is a host.
      if (hostEnd === -1) {
        hostEnd = rest.length;
      }

      this.host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);

      // pull out port
      this.parseHost();

      // we've indicated that there is a hostname,
      // so even if it's empty, it has to be present.
      this.hostname = this.hostname || '';

      // if hostname begins with [ and ends with ]
      // assume that it's an IPv6 address.
      var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';

      // validate a little.
      if (!ipv6Hostname) {
        let hostparts = this.hostname.split(/\./);
        for (let i = 0, l = hostparts.length; i < l; i++) {
          let part = hostparts[i];
          if (!part) {
            continue;
          }

          if (!part.match(hostnamePartPattern)) {
            let newpart = '';
            for (let j = 0, k = part.length; j < k; j++) {
              if (part.charCodeAt(j) > 127) {
                // we replace non-ASCII char with a temporary placeholder
                // we need this to make sure size of hostname is not
                // broken by replacing non-ASCII by nothing
                newpart += 'x';
              } else {
                newpart = part[j];
              }
            }

            // we test again with ASCII char only
            if (!newpart.match(hostnamePartPattern)) {
              let validParts = hostparts.slice(0, i);
              let notHost = hostparts.slice(i + 1);
              let bit = part.match(hostnamePartStart);
              if (bit) {
                validParts.push(bit[1]);
                notHost.unshift(bit[2]);
              }

              if (notHost.length) {
                rest = `/${notHost.join('.')}${rest}`;
              }

              this.hostname = validParts.join('.');
              break;
            }
          }
        }
      }

      if (this.hostname.length > 255) {
        this.hostname = '';
      } else {
        // hostnames are always lower case
        this.hostname = this.hostname.toLowerCase();
      }

      if (!ipv6Hostname) {
        // IDNA Support: Returns a punycoded representation of "domain".
        // it only converts parts of the domain that
        // have non-ASCII characters, i.e. it doesn't matter if
        // you call it with a domain that already is ASCII-only.

        // TODO: uncomment this when I have time to port over punycode.toASCII
        // this.hostname = punycode.toASCII(this.hostname);
      }

      let p = this.port ? `:${this.port}` : '';
      let h = this.hostname || '';
      this.host = h + p;
      this.href += this.host;

      // strip [ and ] from the hostname
      // the host field still retains them, though
      if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
        if (rest[0] !== '/') {
          rest = '/' + rest;
        }
      }
    }

    // now rest is set to the post-host stuff
    // chop off any delim chars
    if (!unsafeProtocol[lowerProto]) {
      // First, make 100% sure that any "autoEscape" chars get
      // escaped, even if encodeURIComponent doesn't think they
      // need to be
      for (let i = 0, l = autoEscape.length; i < l; i++) {
        let ae = autoEscape[i];
        if (rest.indexOf(ae) === -1) {
          continue;
        }

        let esc = encodeURIComponent(ae);
        if (esc === ae) {
          esc = escape(ae);
        }

        rest = rest.splice(ae).join(esc);
      }
    }

    // chop off from the tail first.
    var hash = rest.indexOf('#');
    if (hash !== -1) {
      // got a fragment string
      this.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }

    let qm = rest.indexOf('?');
    if (qm !== -1) {
      this.search = rest.substr(qm);
      this.query = rest.substr(qm + 1);
      rest = rest.slice(0, qm);
    }

    if (rest) {
      this.pathname = rest;
    }

    if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
      this.pathname = '/';
    }

    // to support http.request
    if (this.pathname || this.search) {
      let p = this.pathname || '';
      let s = this.search || '';
      this.path = p + s;
    }

    // finally, reconstruct the href based on what has been validated
    this.href = this.format();
    return this;
  };

  this.parseHost = () => {
    let host = this.host;
    let port = portPattern.exec(host);
    if (port) {
      port = port[0];
      if (port !== ':') {
        this.port = port.substr(1);
      }
      host = host.substr(0, host.length - port.length);
    }
    if (host) {
      this.hostname = host;
    }
  };
}