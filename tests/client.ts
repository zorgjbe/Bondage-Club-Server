import { Socket } from "socket.io-client";
import { withTimeout } from "./helpers";

const TIMEOUT = 2000;
export class Club {
	static loginAccount(client: Socket, accountname: string, password: string) {
		return withTimeout(TIMEOUT, new Promise((resolve) => {
			client.once("LoginResponse", (arg) => {
				resolve(arg);
			});
			
			client.emit("AccountLogin", { AccountName: accountname, Password: password });
		}));
	}
}