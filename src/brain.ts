// Brain is based on https://github.com/andrew-templeton/bottie

import * as Natural from 'natural';

export class Brain {
    classifier: Natural.LogisticRegressionClassifier;
    minConfidence: number;

    constructor() {
        this.classifier = new Natural.LogisticRegressionClassifier();
        this.minConfidence = 0.7;
    }

    teach(samples: Array<string>, label: string) {
        samples.forEach((sample: string) => {
            this.classifier.addDocument(sample.toLowerCase(), label);
        })
    }

    train() {
        this.classifier.train();
    }

    interpret(sample: string) {
        let guesses = this.classifier.getClassifications(sample.toLowerCase()) as any as Array<{ label: string, value: number }>;
        let guess = guesses.reduce((accum, newVal) => {
            return accum && accum.value > newVal.value ? accum : newVal;
        })

        console.log(guesses);

        return guess.value > this.minConfidence ? guess : null;
    };
}