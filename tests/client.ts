import { io, Socket } from "socket.io-client";
import { generateAccount } from "./fake";
import { withTimeout } from "./helpers";
import { DbClient } from "./db";
import { Db } from "mongodb";

const TIMEOUT = 2000;
const DOCKER_SERVER_URL = "http://localhost:4288";

/**
 * Client error class
 */
export class ClientError extends Error {
	constructor(name: string, message?: string) {
		super(message)
		this.name = name;
	}
}

export class Client {
	
	public socket: Socket;
	public account: ServerAccount | Account;
	private db?: DbClient;

	constructor(db?: DbClient) {
		this.socket = io(DOCKER_SERVER_URL);
		// @ts-ignore
		this.account = null;
		this.db = db;
	}

	isConnected() {
		return this.socket.connected;
	}

	connect() {
		return withTimeout(TIMEOUT, new Promise((resolve) => {
			this.socket.on('connect', () => { resolve(true); });
		}));
	}

	async disconnect() {
		await this.socket.disconnect();
		this.socket.close();
	}

	/**
	 * Generate account data for the client
	 */
	generateAccount(accountData?: ServerAccount) {
		if (!this.db) {
			throw new Error('Client has no access to database');
		}
		if (this.account) {
			throw new Error('Client already has account data generated');
		}

		do {
			this.account = generateAccount(accountData);
		} while (!this.db.database.collection('Accounts').findOne({ AccountName: this.account.AccountName }));

		return this.account;
	}


	/**
	 * Remove the client's account from the database
	 */
	async cleanupAccount() {
		if (!this.db) {
			throw new Error('Client has no access to database');
		}
		if (!this.account) return;
		await this.db.database.collection('Accounts').deleteOne({ AccountName: this.account.AccountName });
		// @ts-ignore
		this.account = null;
	}

	/**
	 * Create the client's account
	 */
	async createAccount(accountData?: ServerAccount) {
		if (!this.account) {
			this.generateAccount(accountData);
		}

		return withTimeout(TIMEOUT, new Promise((resolve, reject) => {
			this.socket.on("CreationResponse", (reply) => {
				if (typeof reply === "string") {
					reject(new ClientError(reply, `Failed to create account ${this.account.AccountName}`));
				} else if (typeof reply !== "object") {
					reject(new ClientError("InvalidResponse", `Unexpected response from server: ${reply}`));
				} else {
					const full = this.account as Account;
					full.MemberNumber = reply.MemberNumber;
					full.OnlineID = reply.OnlineID;
					resolve(reply);
				}
			});
			
			this.socket.emit("AccountCreate", this.account);
		}));
	}

	loginAccount(accountname: string, password: string) {
		return withTimeout(TIMEOUT, new Promise((resolve, reject) => {
			this.socket.once("LoginResponse", (reply) => {
				if (reply === "InvalidNamePassword") {
					reject(new ClientError(reply, `Failed to login account ${accountname}`));
				} else {
					resolve(reply);
				}
			});
			
			this.socket.emit("AccountLogin", { AccountName: accountname, Password: password });
		}));
	}

	/**
	 * Create a chatroom.
	 */
	createChatroom(chatroom: ServerChatRoomCreateData): Promise<void> {
		return withTimeout(TIMEOUT, new Promise((resolve, reject) => {
			this.socket.once("ChatRoomCreateResponse", (reply) => {
				if (reply === "ChatRoomCreated") {
					resolve(null);
				} else {
					reject(new ClientError(reply, `Failed to create chatroom: ${reply}, ${JSON.stringify(chatroom)}`));
				}
			});

			this.socket.emit("ChatRoomCreate", chatroom);
		}));
	}

}