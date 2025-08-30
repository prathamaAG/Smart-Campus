// Polyfill fetch and Headers for Node.js (CommonJS)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
globalThis.fetch = fetch;
import('node-fetch').then(({Headers}) => { globalThis.Headers = Headers; });
