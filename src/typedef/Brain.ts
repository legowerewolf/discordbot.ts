// Brain is based on https://github.com/andrew-templeton/bottie

import { LogisticRegressionClassifier } from "natural";
import { NaturalGuess } from "./NaturalGuess";

export class Brain {
	static readonly UncertainLabel = "_unknown";

	classifier: LogisticRegressionClassifier;
	minConfidence: number;

	constructor(confidence: number) {
		this.classifier = new LogisticRegressionClassifier();
		this.minConfidence = confidence;
	}

	teach(samples: Array<string>, label: string): void {
		samples.forEach((sample: string) => {
			this.classifier.addDocument(sample.toLowerCase(), label);
		});
	}

	train(): void {
		this.classifier.train();
	}

	interpret(sample: string): NaturalGuess {
		const guesses = this.classifier.getClassifications(sample.toLowerCase()) as Array<NaturalGuess>;
		const guess = guesses.reduce((accum, newVal) => {
			return accum && accum.value > newVal.value ? accum : newVal;
		});

		return guess.value > this.minConfidence ? guess : { label: Brain.UncertainLabel, value: 0 };
	}
}
