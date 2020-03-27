import { QuestionData } from "./QuestionData";
export interface IntentData {
	responses?: Array<string>;
	question?: QuestionData;
	handlerSpecific?: any;
}
