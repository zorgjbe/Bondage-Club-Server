import { Socket } from "socket.io-client";

const TIMEOUT = 2000;
export class Club {
	/**
	* @param {number} timeout
	* @param {Promise} promise
	*/
	private static async withTimeout(timeout: number, promise: Promise<unknown>) {
		let timer: NodeJS.Timeout;
		return await Promise.race([
			new Promise((resolve) => {
				resolve(promise);
			}),
			new Promise((_, reject) => {
				timer = setTimeout(() => reject(new Error('Timed out')), timeout);
			})
		]).finally(() => clearTimeout(timer));
	}
	
	static loginAccount(client: Socket, accountname: string, password: string) {
		return this.withTimeout(TIMEOUT, new Promise((resolve) => {
			client.once("LoginResponse", (arg) => {
				resolve(arg);
			});
			
			client.emit("AccountLogin", { AccountName: accountname, Password: password });
		}));
	}
}