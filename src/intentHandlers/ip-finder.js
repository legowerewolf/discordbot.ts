const fetch = require('node-fetch');

module.exports = {
    handler: function (responseCallback) {
        fetch("http://ip-api.com/json").then((response) => response.json()).then((text) => { responseCallback(`your IP address is ${text.query}.`) });
    }
}