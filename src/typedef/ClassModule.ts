import { Class } from "./Class";

/** Type of a module exporting a class default
 * @param T - The name of the module's default export class
 */
export interface ClassModule<T> {
	default: Class<T>;
}
