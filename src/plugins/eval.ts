import { responseToQuestion } from "../helpers/responseToQuestion";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

export default class EvalPlugin extends Plugin<never> {
	context: DiscordBot;

	inject(context: DiscordBot) {
		context.handlers = {
			...context.handlers,
			eval: this.evaluate.bind(context),
		};

		this.context = context;
	}

	evaluate(eventData: CommunicationEvent): void {
		responseToQuestion(eventData).then((resp: string) => {
			let res;
			try {
				res = JSON.stringify(eval(resp));
			} catch (e) {
				res = JSON.stringify(e);
			}
			eventData.responseCallback(res);
		});
	}

	extract() {
		return;
	}
}
