const querystring = require('querystring');

async function readStreamBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf8');
}

async function readRequestBody(req) {
    const contentType = String(req.headers?.['content-type'] || '').toLowerCase();

    if (req.body !== undefined && req.body !== null) {
        if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
            return req.body;
        }
        if (typeof req.body === 'string') {
            if (contentType.includes('application/json')) {
                try {
                    return JSON.parse(req.body);
                } catch {
                    return {};
                }
            }
            if (contentType.includes('application/x-www-form-urlencoded')) {
                return querystring.parse(req.body);
            }
        }
    }

    if (typeof req.on === 'function') {
        const raw = await readStreamBody(req);
        if (!raw) return {};
        if (contentType.includes('application/json')) {
            try {
                return JSON.parse(raw);
            } catch {
                return {};
            }
        }
        return querystring.parse(raw);
    }

    return {};
}

module.exports = { readRequestBody };
