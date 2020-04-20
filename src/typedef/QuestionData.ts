export interface QuestionData {
	askMessage?: Array<string>;
	answeredMessage?: Array<string>;
	timeoutMessage?: Array<string>;
	timeout?: number; // ms
	defaults?: Array<string>;
}
