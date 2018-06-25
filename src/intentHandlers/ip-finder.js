const fetch = require('node-fetch');

module.exports = {
    handler: function (eventData) {
        fetch("http://ip-api.com/json").then((response) => response.json()).then((text) => { eventData.responseCallback(`your IP address is ${text.query}.`) });
    }
}