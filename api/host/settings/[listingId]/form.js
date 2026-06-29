const { handleFormGet } = require('../../../../server/host-settings-form');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Method not allowed');
        return;
    }

    req.params = { listingId: req.query.listingId };
    await handleFormGet(req, res);
};
