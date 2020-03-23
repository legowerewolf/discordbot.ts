// Brain is based on https://github.com/andrew-templeton/bottie

import { LogisticRegressionClassifier } from "natural";

export interface NaturalGuess {
	label: string;
	value: number;
}

export class Brain {
	static readonly UncertainLabel = "_unknown";

	private classifier: LogisticRegressionClassifier;
	minConfidence: number;

	constructor(minConfidence: number) {
		this.classifier = new LogisticRegressionClassifier();
		this.minConfidence = minConfidence;
	}

	/**
	 *
	 * @param samples - sample data to prepare the [[Brain]] to recognize
	 * @param label - a label for the given samples
	 */
	teach(samples: Array<string>, label: string): void {
		samples.forEach((sample: string) => {
			this.classifier.addDocument(sample.toLowerCase(), label);
		});
	}

	/**
	 * Train the classifier to recognize the samples provided
	 */
	train(): void {
		this.classifier.train();
	}

	/**
	 *
	 * @param sample - a sample you want the brain to classify
	 */
	interpret(sample: string): NaturalGuess {
		const guesses = this.classifier.getClassifications(sample.toLowerCase()) as Array<NaturalGuess>;
		const guess = guesses.reduce((accum, newVal) => {
			return accum && accum.value > newVal.value ? accum : newVal;
		});

		return guess.value > this.minConfidence ? guess : { label: Brain.UncertainLabel, value: 0 };
	}
}
