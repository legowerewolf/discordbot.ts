module.exports = {
    handler: function(eventData) {
        eventData.responseCallback(eventData.config.responses[Math.floor(Math.random() * eventData.config.responses.length)]);
    }
}