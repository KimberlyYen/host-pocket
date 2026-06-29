(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;
    const IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80';
    const MAX_IMAGE_WIDTH = 800;

    global.registerHostSettingsController('experience-pick', class extends Controller {
        static targets = [
            'imgInput', 'imgPreview', 'imgPlaceholder', 'imgFile', 'imgClearBtn',
            'peekImg', 'peekPlaceholder', 'titlePeek', 'titleInput'
        ];
        static values = { index: Number };

        connect() {
            this.onAttractionSelected = (event) => {
                if (event.detail?.index !== this.indexValue) return;
                this.syncImgPreview();
            };
            this.onFormFilled = () => this.syncImgPreview();
            global.document.addEventListener('host-settings:attraction-selected', this.onAttractionSelected);
            global.document.addEventListener('host-settings:form-filled', this.onFormFilled);
            this.syncImgPreview();
        }

        disconnect() {
            global.document.removeEventListener('host-settings:attraction-selected', this.onAttractionSelected);
            global.document.removeEventListener('host-settings:form-filled', this.onFormFilled);
        }

        openPicker(event) {
            event?.preventDefault?.();
            event?.stopPropagation?.();
            this.dispatch('open', {
                prefix: 'experience-pick',
                bubbles: true,
                detail: { index: this.indexValue }
            });
        }

        pickImg(event) {
            const file = event.target.files?.[0];
            if (!file || !file.type.startsWith('image/')) return;

            const compress = global.HostPocketImageUpload?.fileToDataUrl || ((f) => this.fileToDataUrl(f));
            compress(file)
                .then((dataUrl) => {
                    this.imgInputTarget.value = dataUrl;
                    this.imgInputTarget.dispatchEvent(new Event('input', { bubbles: true }));
                })
                .catch(() => {
                    if (this.hasImgFileTarget) this.imgFileTarget.value = '';
                });
        }

        clearImg() {
            if (this.hasImgFileTarget) this.imgFileTarget.value = '';
            this.imgInputTarget.value = '';
            this.syncImgPreview();
        }

        fileToDataUrl(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                        const scale = img.width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH / img.width : 1;
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

        readImgUrl() {
            if (this.hasImgInputTarget) return this.imgInputTarget.value.trim();
            const input = this.element.querySelector(`input[type="hidden"][name="recImg${this.indexValue}"]`);
            return input?.value?.trim() || '';
        }

        syncImgPreview() {
            const url = this.readImgUrl();

            this.updateImageTarget(
                this.hasImgPreviewTarget ? this.imgPreviewTarget : null,
                url,
                this.hasImgPlaceholderTarget ? this.imgPlaceholderTarget : null,
                { useHiddenClass: true },
                () => {
                    if (this.hasImgClearBtnTarget) {
                        this.imgClearBtnTarget.classList.toggle('hidden', !url);
                    }
                }
            );
            this.syncPeek();
        }

        syncPeek() {
            if (this.hasTitlePeekTarget) {
                const title = this.hasTitleInputTarget
                    ? this.titleInputTarget.value.trim()
                    : this.element.querySelector(`input[name="recTitle${this.indexValue}Zh"]`)?.value?.trim() || '';
                this.titlePeekTarget.textContent = title || '尚未設定';
            }

            if (!this.hasPeekImgTarget) return;

            this.updateImageTarget(
                this.peekImgTarget,
                this.readImgUrl(),
                this.hasPeekPlaceholderTarget ? this.peekPlaceholderTarget : null,
                { useHiddenClass: false }
            );
        }

        updateImageTarget(img, url, placeholder, options = {}, onSettled) {
            if (!img) return;

            const useHiddenClass = options.useHiddenClass !== false;

            const showPlaceholder = () => {
                if (useHiddenClass) img.classList.add('hidden');
                img.classList.remove('is-loaded');
                img.removeAttribute('src');
                placeholder?.classList.remove('hidden');
                onSettled?.();
            };

            const showImage = () => {
                if (useHiddenClass) img.classList.remove('hidden');
                img.classList.add('is-loaded');
                placeholder?.classList.add('hidden');
                onSettled?.();
            };

            img.onload = showImage;
            img.onerror = () => {
                if (url.startsWith('http') && !img.src.includes('photo-1469854523086')) {
                    img.src = IMAGE_FALLBACK;
                    return;
                }
                showPlaceholder();
            };

            if (!url) {
                showPlaceholder();
                return;
            }

            // Must not keep display:none while loading — browsers skip fetch for hidden imgs.
            if (useHiddenClass) img.classList.remove('hidden');
            img.classList.remove('is-loaded');
            img.src = url;

            if (img.complete && img.naturalWidth > 0) showImage();
        }
    });
})(window);
