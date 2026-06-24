module.exports = async (req, res) => {
    const code = req.query?.code;
    if (!code) {
        res.status(400).send('Missing authorization code.');
        return;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>Google 授權</title></head>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:40px auto;padding:0 16px">
<h1>授權成功</h1>
<p>請複製下方 authorization code，貼到終端機執行 <code>npm run google:auth</code> 的提示中：</p>
<pre style="background:#f5f5f5;padding:12px;border-radius:8px;word-break:break-all">${code}</pre>
</body></html>`);
};
