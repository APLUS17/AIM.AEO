// Fetches a user-supplied web page without letting it reach our own network (SSRF guard).
// Every connection, including each redirect hop, is checked at the moment the socket resolves
// the hostname, so DNS tricks and rebinding can't point us at a private address.
import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';

const MAX_REDIRECTS = 3;
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_BYTES = 300_000;

const blocked = new net.BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 4], ['240.0.0.0', 4]
]) blocked.addSubnet(address, prefix, 'ipv4');
for (const [address, prefix] of [
  ['::', 128], ['::1', 128], ['64:ff9b::', 96], ['100::', 64], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8]
]) blocked.addSubnet(address, prefix, 'ipv6');

// An IPv4-mapped IPv6 address (::ffff:a.b.c.d or ::ffff:7f00:1) is judged by the IPv4 address inside it.
function unmapIPv4(address) {
  const dotted = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (dotted) return dotted[1];
  const hex = address.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (!hex) return null;
  const [high, low] = [parseInt(hex[1], 16), parseInt(hex[2], 16)];
  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
}

export function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (!family) return true;
  if (family === 6) {
    const mapped = unmapIPv4(address);
    if (mapped) return isPrivateAddress(mapped);
  }
  return blocked.check(address, family === 6 ? 'ipv6' : 'ipv4');
}

function safeLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error);
    if (!addresses.length || addresses.some(a => isPrivateAddress(a.address))) {
      return callback(new Error(`Blocked address for ${hostname}`));
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

function assertAllowed(url) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only http(s) URLs are allowed');
  if (url.username || url.password) throw new Error('URLs with credentials are not allowed');
  if (url.port && url.port !== '80' && url.port !== '443') throw new Error('Only ports 80 and 443 are allowed');
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Blocked host');
  }
  if (net.isIP(host) && isPrivateAddress(host)) throw new Error('Blocked address');
}

function getOnce(url, { timeoutMs, maxBytes }) {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === 'https:' ? https : http;
    const timer = setTimeout(() => req.destroy(new Error('Timed out')), timeoutMs);
    const req = lib.request(
      url,
      {
        method: 'GET',
        lookup: safeLookup,
        headers: { 'user-agent': 'AiM-Grader/1.0', accept: 'text/html,application/xhtml+xml', 'accept-encoding': 'identity' }
      },
      res => {
        const chunks = [];
        let size = 0;
        res.on('data', chunk => {
          size += chunk.length;
          if (size > maxBytes) return res.destroy();
          chunks.push(chunk);
        });
        const finish = () => {
          clearTimeout(timer);
          resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') });
        };
        res.on('end', finish);
        res.on('close', finish);
        res.on('error', error => {
          clearTimeout(timer);
          reject(error);
        });
      }
    );
    req.on('error', error => {
      clearTimeout(timer);
      reject(error);
    });
    req.end();
  });
}

// Returns { url, html } for the final page, or throws. Non-HTML responses give html: ''.
export async function fetchHtml(startUrl, { timeoutMs = DEFAULT_TIMEOUT_MS, maxBytes = DEFAULT_MAX_BYTES } = {}) {
  let url = new URL(startUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    assertAllowed(url);
    const res = await getOnce(url, { timeoutMs, maxBytes });
    if ([301, 302, 303, 307, 308].includes(res.status) && res.headers.location) {
      url = new URL(res.headers.location, url);
      continue;
    }
    if (res.status >= 400) throw new Error(`Site returned ${res.status}`);
    const type = String(res.headers['content-type'] ?? '');
    return { url: url.href, html: /html|xml/i.test(type) ? res.body : '' };
  }
  throw new Error('Too many redirects');
}
