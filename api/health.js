module.exports = async (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const configured = Boolean(
        process.env.GOOGLE_CLIENT_ID
        && process.env.GOOGLE_CLIENT_SECRET
        && process.env.GOOGLE_REFRESH_TOKEN
    );
    res.status(200).json({
        ok: true,
        bookingConfigured: configured,
        resendConfigured: Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL)
    });
};
