import { io, Socket } from "socket.io-client";
import { withTimeout } from "./helpers";

const TIMEOUT = 2000;
const DOCKER_SERVER_URL = "http://localhost:4288";

export class ClientError extends Error {
	constructor(name: string, message?: string) {
		super(message)
		this.name = name;
	}
}

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
		return withTimeout(TIMEOUT, new Promise((resolve, reject) => {
			client.once("LoginResponse", (reply) => {
				if (reply === "InvalidNamePassword") {
					reject(new ClientError(reply, `Failed to login account ${accountname}`));
				} else {
					resolve(reply);
				}
			});
			
			client.emit("AccountLogin", { AccountName: accountname, Password: password });
		}));
	}

	/**
	 * Create a chatroom.
	 */
	static createChatroom(client: Socket, chatroom: ServerChatRoomCreateData): Promise<void> {
		return withTimeout(TIMEOUT, new Promise((resolve, reject) => {
			client.once("ChatRoomCreateResponse", (reply) => {
				if (reply === "ChatRoomCreated") {
					resolve(null);
				} else {
					reject(new ClientError(reply, `Failed to create chatroom: ${reply}, ${JSON.stringify(chatroom)}`));
				}
			});

			client.emit("ChatRoomCreate", chatroom);
		}));

	}

}