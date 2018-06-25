module.exports = {
    handler: function(eventData) {
        console.log(eventData.config.responses)
        eventData.responseCallback(eventData.config.responses[Math.floor(Math.random() * eventData.config.responses.length)]);
    }
}