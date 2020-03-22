import { QuestionData } from "./QuestionData";
export interface IntentData {
	responses?: Array<string>;
	questionData?: QuestionData;
	handlerSpecific?: any;
}
