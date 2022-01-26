import { io, Socket } from "socket.io-client";
import { withTimeout } from "./helpers";

const TIMEOUT = 2000;
const DOCKER_SERVER_URL = "http://localhost:4288";

export class Club {
	
	/**
	 * Create a test client.
	 *
	 * @param connected - Connect the client to the server
	 * @returns {Promise<Socket>}
	 */
	static createClient(connected: boolean = true): Promise<Socket> {
		const client = io(DOCKER_SERVER_URL);
		if (!connected) {
			return new Promise((resolve) => resolve(client))
		} else {
			return withTimeout(TIMEOUT, new Promise((resolve) => {
				client.on('connect', () => { resolve(client); });
			}));
		}
	}

	static loginAccount(client: Socket, accountname: string, password: string) {
		return withTimeout(TIMEOUT, new Promise((resolve) => {
			client.once("LoginResponse", (arg) => {
				resolve(arg);
			});
			
			client.emit("AccountLogin", { AccountName: accountname, Password: password });
		}));
	}
}