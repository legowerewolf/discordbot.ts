// Brain is based on https://github.com/andrew-templeton/bottie

import { LogisticRegressionClassifier } from 'natural';
import { NaturalGuess } from './types';

export class Brain {
    classifier: LogisticRegressionClassifier;
    minConfidence: number;

    constructor(confidence: number) {
        this.classifier = new LogisticRegressionClassifier();
        this.minConfidence = confidence;
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
        let guesses = this.classifier.getClassifications(sample.toLowerCase()) as any as Array<NaturalGuess>;
        let guess = guesses.reduce((accum, newVal) => {
            return accum && accum.value > newVal.value ? accum : newVal;
        })

        return guess.value > this.minConfidence ? guess : null;
    };
}