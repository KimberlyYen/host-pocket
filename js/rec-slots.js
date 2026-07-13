/**
 * Shared recommendation slot helpers (host settings + guest guide).
 * Slots 1–4 are always present; hosts can add up to MAX_REC_SLOTS.
 */
(function (global) {
    const MAX_REC_SLOTS = 10;
    const DEFAULT_REC_SLOTS = 4;

    function buildRecSlotFields(slot) {
        const i = Number(slot);
        return [
            `recExperienceId${i}`,
            `recTitle${i}Zh`, `recTitle${i}En`, `recImg${i}`,
            `recBadge${i}Zh`, `recBadge${i}En`,
            `recDist${i}Zh`, `recDist${i}En`,
            `recPrice${i}Zh`, `recPrice${i}En`,
            `recRating${i}`, `recReviews${i}`,
            `recCategory${i}Zh`, `recCategory${i}En`,
            `desc${i}Zh`, `desc${i}En`,
            `recExplorerDist${i}Zh`, `recExplorerDist${i}En`,
            `recExplorerEst${i}Zh`, `recExplorerEst${i}En`
        ];
    }

    function buildAllRecFields(max = MAX_REC_SLOTS) {
        const fields = [];
        for (let i = 1; i <= max; i += 1) {
            fields.push(...buildRecSlotFields(i));
        }
        return fields;
    }

    function highestFilledRecSlot(data, max = MAX_REC_SLOTS) {
        let highest = DEFAULT_REC_SLOTS;
        if (!data) return highest;
        for (let i = max; i >= 1; i -= 1) {
            const title = String(data[`recTitle${i}Zh`] || data[`recTitle${i}En`] || '').trim();
            const expId = String(data[`recExperienceId${i}`] || '').trim();
            if (title || expId) return Math.max(DEFAULT_REC_SLOTS, i);
        }
        return highest;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /** Client-side HTML for one experience-pick panel (matches partials/host_settings/_experience_pick_collapsed.html). */
    function buildExperiencePickHtml(slot) {
        const n = Number(slot);
        if (!Number.isFinite(n) || n < 1 || n > MAX_REC_SLOTS) return '';
        return `
<section class="hp-card hp-card--stack hp-card--pick" data-rec-slot="${n}">
<details class="hp-collapse hp-pick-collapse" data-controller="experience-pick" data-experience-pick-index-value="${n}">
    <summary class="hp-collapse__trigger hp-pick-collapse__summary">
        <span class="hp-pick-collapse__peek flex items-center gap-3 min-w-0 flex-1">
            <span class="hp-pick-collapse__thumb shrink-0">
                <img data-experience-pick-target="peekImg" alt="" class="hp-pick-collapse__thumb-img">
                <i data-experience-pick-target="peekPlaceholder" class="fa-regular fa-image text-hp-muted/35 text-sm" aria-hidden="true"></i>
            </span>
            <span class="min-w-0 flex-1">
                <span class="text-xs font-black flex items-center gap-2"><i class="fa-solid fa-star text-hp-coral"></i> 推薦地點 ${n}</span>
                <span data-experience-pick-target="titlePeek" class="text-sm font-medium text-hp-dark line-clamp-1 mt-0.5">尚未設定</span>
            </span>
        </span>
        <span class="hp-collapse__action" aria-hidden="true">
            <span class="hp-collapse__label-expand">編輯</span>
            <span class="hp-collapse__label-collapse">收合</span>
            <i class="fa-solid fa-chevron-down hp-collapse__chevron"></i>
        </span>
    </summary>
    <div class="hp-collapse__body">
        <div class="flex justify-end mb-3">
            <button type="button" class="shrink-0 px-2.5 py-1 rounded-lg border border-hp-coral/30 bg-hp-coral/5 text-[10px] font-bold text-hp-coral hover:bg-hp-coral/10 transition whitespace-nowrap"
                    data-action="click->experience-pick#openPicker">
                快速選擇景點
            </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="hidden" name="recExperienceId${n}">
            <label class="block space-y-1"><span class="field-label">標題（繁中）</span><input name="recTitle${n}Zh" class="field-input" data-experience-pick-target="titleInput" data-action="input->experience-pick#syncPeek change->experience-pick#syncPeek"></label>
            <label class="block space-y-1"><span class="field-label">Title (EN)</span><input name="recTitle${n}En" class="field-input"></label>
            <div class="sm:col-span-2 space-y-1">
                <span class="field-label">封面圖</span>
                <div class="flex flex-wrap gap-3 items-center">
                    <div class="shrink-0 w-14 h-14 rounded-lg border border-hp-border bg-white overflow-hidden shadow-sm flex items-center justify-center">
                        <img data-experience-pick-target="imgPreview" alt="" loading="lazy" class="w-full h-full object-cover hidden">
                        <i data-experience-pick-target="imgPlaceholder" class="fa-regular fa-image text-hp-muted/35 text-base" aria-hidden="true"></i>
                    </div>
                    <div class="flex flex-wrap gap-2 items-center min-w-0">
                        <label class="hp-file-picker">
                            <i class="fa-solid fa-image text-hp-coral text-[10px]" aria-hidden="true"></i>
                            選擇圖片
                            <input type="file" accept="image/*" class="sr-only"
                                   data-experience-pick-target="imgFile"
                                   data-action="change->experience-pick#pickImg">
                        </label>
                        <button type="button"
                                data-experience-pick-target="imgClearBtn"
                                data-action="click->experience-pick#clearImg"
                                class="hidden hp-file-picker hp-file-picker--ghost">
                            移除
                        </button>
                    </div>
                </div>
                <input type="hidden" name="recImg${n}" data-experience-pick-target="imgInput"
                       data-action="input->experience-pick#syncImgPreview change->experience-pick#syncImgPreview">
            </div>
            <label class="block space-y-1"><span class="field-label">標籤（繁中）</span><input name="recBadge${n}Zh" class="field-input"></label>
            <label class="block space-y-1"><span class="field-label">Badge (EN)</span><input name="recBadge${n}En" class="field-input"></label>
            <label class="block space-y-1"><span class="field-label">距離（繁中）</span><input name="recDist${n}Zh" class="field-input"></label>
            <label class="block space-y-1"><span class="field-label">Distance (EN)</span><input name="recDist${n}En" class="field-input"></label>
            <label class="block space-y-1"><span class="field-label">價格（繁中）</span><input name="recPrice${n}Zh" class="field-input"></label>
            <label class="block space-y-1"><span class="field-label">Price (EN)</span><input name="recPrice${n}En" class="field-input"></label>
            <label class="block space-y-1 sm:col-span-2"><span class="field-label">房東推薦文案（繁中）</span><textarea name="desc${n}Zh" rows="2" class="field-input"></textarea></label>
            <label class="block space-y-1 sm:col-span-2"><span class="field-label">Description (EN)</span><textarea name="desc${n}En" rows="2" class="field-input"></textarea></label>
            <label class="block space-y-1"><span class="field-label">地圖距離（繁中）</span><input name="recExplorerDist${n}Zh" class="field-input"></label>
            <label class="block space-y-1"><span class="field-label">Map distance (EN)</span><input name="recExplorerDist${n}En" class="field-input"></label>
        </div>
    </div>
</details>
</section>`.trim();
    }

    function buildGuestRecCardHtml(slot) {
        const n = Number(slot);
        return `
<div class="min-w-[210px] w-[210px] snap-start bg-white rounded-2xl overflow-hidden shadow-sm border border-hp-border group text-left hover:border-hp-coral transition" data-rec-card="${n}">
    <div role="button" tabindex="0" data-action="click->dashboard#openExperienceDetail" data-rec="${n}"
         class="w-full text-left cursor-pointer active:scale-[0.98] transition">
        <div class="h-32 overflow-hidden relative bg-black">
            <video data-dashboard-target="recVideo${n}" class="rec-card-video absolute inset-0 w-full h-full object-cover pointer-events-none group-hover:scale-105 transition duration-500" muted playsinline webkit-playsinline loop disablepictureinpicture disableremoteplayback preload="auto" autoplay></video>
            <span class="absolute top-2.5 left-2.5 bg-hp-bgLight/90 backdrop-blur text-hp-dark text-xs font-black px-2 py-1 rounded-md border border-hp-border">
                <span data-dashboard-target="recBadge${n}"></span>
            </span>
            <span data-dashboard-target="recRating${n}" class="absolute top-2.5 right-2.5 bg-black/45 text-white text-xs font-bold px-1.5 py-0.5 rounded-md"></span>
        </div>
        <div class="p-3">
            <h5 data-dashboard-target="recTitle${n}" class="font-bold text-xs text-hp-dark line-clamp-1 leading-snug"></h5>
            <p data-dashboard-target="recDist${n}" class="text-xs text-[#8C807A] mt-0.5"></p>
            <div class="flex justify-between items-center mt-2 pt-2 border-t border-hp-bgLight">
                <p data-dashboard-target="recPrice${n}" class="text-xs text-hp-coral font-bold"></p>
                <span class="text-xs text-hp-muted font-bold" data-global-lang="zh">詳情</span>
                <span class="text-xs text-hp-muted font-bold hidden" data-global-lang="en">Details</span>
            </div>
        </div>
    </div>
</div>`.trim();
    }

    global.HostPocketRecSlots = {
        MAX_REC_SLOTS,
        DEFAULT_REC_SLOTS,
        buildRecSlotFields,
        buildAllRecFields,
        highestFilledRecSlot,
        buildExperiencePickHtml,
        buildGuestRecCardHtml,
        escapeHtml
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = global.HostPocketRecSlots;
    }
})(typeof window !== 'undefined' ? window : global);
