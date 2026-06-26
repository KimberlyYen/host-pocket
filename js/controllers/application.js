/**
 * Stimulus application bootstrap (Rails 8 / Hotwire style).
 */
(function (global) {
    if (typeof Stimulus === 'undefined') {
        console.error('[host-pocket] Stimulus failed to load');
        return;
    }

    if (global.__hpHostSettingsStimulusApp) return;

    const app = Stimulus.Application.start();
    global.__hpHostSettingsStimulusApp = app;

    global.registerHostSettingsController = function registerHostSettingsController(name, controllerClass) {
        app.register(name, controllerClass);
    };
})(window);
