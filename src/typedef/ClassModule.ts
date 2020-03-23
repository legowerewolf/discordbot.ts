import { Class } from "./Class";

/**
 * @param T - THe name of the module's default export class
 */
export interface ClassModule<T> {
	default: Class<T>;
}
