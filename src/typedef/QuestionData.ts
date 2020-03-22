export interface QuestionData {
	question?: Array<string>;
	answeredResponse?: Array<string>;
	timeoutResponse?: Array<string>;
	timeout?: number; // ms
	defaultResponses?: Array<string>;
}
