// Brain is based on https://github.com/andrew-templeton/bottie

const Natural = require('natural');

module.exports = Brain;

function Brain() {
    this.classifier = new Natural.LogisticRegressionClassifier();
    this.minConfidence = 0.7;
}

Brain.prototype.teach = function (samples, label) {
    samples.forEach(function (sample) {
        this.classifier.addDocument(sample.toLowerCase(), label);
    }.bind(this));
    return this;
};

Brain.prototype.train = function () {
    this.classifier.train();
    return this;
};

Brain.prototype.interpret = function (sample) {
    var guess = this.classifier.getClassifications(sample.toLowerCase()).reduce(toMaxValue);
    return guess;
};

function toMaxValue(x, y) {
    return x && x.value > y.value ? x : y;
}