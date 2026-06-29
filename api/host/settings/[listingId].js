const { readRequestBody } = require('../../../server/read-request-body');
const { handleFormPost } = require('../../../server/host-settings-form');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Method not allowed');
        return;
    }

    req.params = { listingId: req.query.listingId };
    req.body = await readRequestBody(req);
    await handleFormPost(req, res);
};
