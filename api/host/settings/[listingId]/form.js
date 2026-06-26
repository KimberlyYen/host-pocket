const { handleFormGet } = require('../../../../server/host-settings-form');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).type('text/plain').send('Method not allowed');
        return;
    }

    req.params = { listingId: req.query.listingId };
    await handleFormGet(req, res);
};
