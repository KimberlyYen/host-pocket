(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;
    const IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80';

    global.registerHostSettingsController('room-gallery', class extends Controller {
        static targets = ['galleryText', 'previewGrid', 'fileInput', 'emptyHint'];

        connect() {
            this.onFormFilled = () => this.syncFromTextarea();
            global.document.addEventListener('host-settings:form-filled', this.onFormFilled);
            this.syncFromTextarea();
        }

        disconnect() {
            global.document.removeEventListener('host-settings:form-filled', this.onFormFilled);
        }

        parseLines() {
            if (!this.hasGalleryTextTarget) return [];
            return String(this.galleryTextTarget.value || '')
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean);
        }

        writeLines(lines) {
            if (!this.hasGalleryTextTarget) return;
            this.galleryTextTarget.value = lines.join('\n');
            this.galleryTextTarget.dispatchEvent(new Event('input', { bubbles: true }));
        }

        syncFromTextarea() {
            if (!this.hasPreviewGridTarget) return;
            const lines = this.parseLines();
            this.renderPreviews(lines);
        }

        renderPreviews(lines) {
            if (!this.hasPreviewGridTarget) return;

            if (!lines.length) {
                this.previewGridTarget.innerHTML = '';
                if (this.hasEmptyHintTarget) this.emptyHintTarget.classList.remove('hidden');
                return;
            }

            if (this.hasEmptyHintTarget) this.emptyHintTarget.classList.add('hidden');

            this.previewGridTarget.innerHTML = lines.map((url, index) => `
                <div class="relative shrink-0 w-16 h-16 rounded-lg border border-hp-border bg-white overflow-hidden shadow-sm group">
                    <img src="${this.escapeAttr(url)}" alt="" loading="lazy"
                         class="w-full h-full object-cover"
                         onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'">
                    <button type="button"
                            class="absolute top-0.5 right-0.5 w-5 h-5 rounded-md bg-black/55 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
                            data-action="click->room-gallery#removeAt"
                            data-index="${index}"
                            aria-label="移除照片">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `).join('');
        }

        async pickFiles(event) {
            const files = event.target.files;
            if (!files?.length) return;

            try {
                const uploaded = await global.HostPocketImageUpload.compressFiles(files);
                if (!uploaded.length) return;
                this.writeLines([...this.parseLines(), ...uploaded]);
                this.syncFromTextarea();
            } catch (error) {
                console.warn('[room-gallery] upload failed', error);
            } finally {
                if (this.hasFileInputTarget) this.fileInputTarget.value = '';
            }
        }

        removeAt(event) {
            const index = Number(event.currentTarget.dataset.index);
            if (Number.isNaN(index)) return;
            const lines = this.parseLines();
            lines.splice(index, 1);
            this.writeLines(lines);
            this.syncFromTextarea();
        }

        clearAll() {
            this.writeLines([]);
            this.syncFromTextarea();
        }

        escapeAttr(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
    });
})(window);
