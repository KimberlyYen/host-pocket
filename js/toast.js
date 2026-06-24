(function (global) {
    function show(_title, _message, _type, _options) {
        // Toasts disabled — rely on inline UI feedback (dialogs, form states, etc.).
    }

    global.hpTriggerToast = show;
    global.HostPocketToast = { show };
})(window);
