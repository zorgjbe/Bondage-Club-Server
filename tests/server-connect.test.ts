import { Client } from "./client";

describe("server", () => {
	let client: Client;

	beforeAll(() => {
		client = new Client();
	});

	afterAll(() => {
		if (client.isConnected()) {
			client.disconnect();
		}
		client.disconnect();
	});

	test("can connect and recieve banner", (done) => {
		expect.assertions(4);

		expect(client.isConnected()).toBe(false);

		client.socket.once("ServerInfo", (msg: ServerInfoMessage) => {
			expect(msg.OnlinePlayers).toBeGreaterThanOrEqual(0);
			expect(msg.Time).toBeGreaterThanOrEqual(0);
			done();
		});

		client.socket.on("connect", () => {
			try {
				expect(client.isConnected()).toBe(true);
			} catch (error) {
				done(error);
			}
		});
	});

});
