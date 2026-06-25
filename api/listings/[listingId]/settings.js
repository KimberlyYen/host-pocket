const { handleListingSettings } = require('../../../server/listing-settings-handler');

module.exports = async (req, res) => {
    await handleListingSettings(req, res, req.query.listingId);
};
