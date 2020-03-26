export interface PersistenceProvider {
	readUser<T>(userID: string, query: T): Promise<T>;
	writeUser(userID: string, data: object): Promise<Date>;
}
