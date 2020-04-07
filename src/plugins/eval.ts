import { responseToQuestion } from "../helpers/responseToQuestion";
import { CommunicationEvent } from "../typedef/CommunicationEvent";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";
import { Vocab } from "../typedef/Vocab";

export default class EvalPlugin extends Plugin<never> {
	inject(context: DiscordBot): void {
		this.declareHandler("eval", this.evaluate.bind(context));
	}

	evaluate(eventData: CommunicationEvent): void {
		responseToQuestion(eventData).then((resp: string) => {
			let res;
			try {
				res = JSON.stringify(eval(resp));
			} catch (e) {
				eventData.bot.console(e, Vocab.Warn);
				res = JSON.stringify({ exception: e });
			}
			eventData.responseCallback(res);
		});
	}

	extract(): void {
		this.clearHandlers();
	}
}
