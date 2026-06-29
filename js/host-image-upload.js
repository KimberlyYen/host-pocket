/**
 * Shared image compression for host settings uploads (base64 data URLs).
 */
(function (global) {
    const MAX_IMAGE_WIDTH = 800;

    function fileToDataUrl(file, maxWidth = MAX_IMAGE_WIDTH) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
                    const width = Math.round(img.width * scale);
                    const height = Math.round(img.height * scale);
                    const canvas = global.document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function compressFiles(files, maxWidth = MAX_IMAGE_WIDTH) {
        const list = Array.from(files || []).filter((file) => file?.type?.startsWith('image/'));
        const urls = [];
        for (const file of list) {
            urls.push(await fileToDataUrl(file, maxWidth));
        }
        return urls;
    }

    global.HostPocketImageUpload = {
        MAX_IMAGE_WIDTH,
        fileToDataUrl,
        compressFiles
    };
})(window);
