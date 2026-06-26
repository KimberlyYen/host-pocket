const { readRequestBody } = require('../../../server/read-request-body');
const { handleFormPost } = require('../../../server/host-settings-form');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).type('text/plain').send('Method not allowed');
        return;
    }

    req.params = { listingId: req.query.listingId };
    req.body = await readRequestBody(req);
    await handleFormPost(req, res);
};
