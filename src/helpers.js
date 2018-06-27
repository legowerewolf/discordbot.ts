module.exports = {
    randomElementFromArray: function (array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    responseToQuestion: function (eventData, questionData) {
        var response;

        if (eventData.source == "text") {
            eventData.responseCallback(questionData.question);
            var index = 0;
            var maxIndex = eventData.config.checkForResponseDuration / eventData.config.checkForResponseInterval;
            var currentMessageID = eventData.messageObject.id;

            var intervalChecker = setInterval(() => {
                if (eventData.author.lastMessageID != currentMessageID || index > maxIndex) {
                    if (eventData.author.lastMessageID != currentMessageID) {
                        response = eventData.author.lastMessage.cleanContent;
                        eventData.responseCallback(questionData.questionAnswered);
                    } else if (index > maxIndex) {
                        eventData.responseCallback(questionData.questionTimeout);
                    }
                    clearInterval(intervalChecker);
                    questionData.callback(response);
                }
                index += 1;
            }, eventData.config.checkForResponseInterval);
        } else {
            questionData.callback(response);
        }

    }
}