const helpers = require("../helpers");

module.exports = {
    handler: function (eventData) {
        eventData.responseCallback(helpers.randomElementFromArray(eventData.config.responses));
        setTimeout(() => {
            eventData.client.destroy();
        }, eventData.config.shutdownDelay)
    }
}