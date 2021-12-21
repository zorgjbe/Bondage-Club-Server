import { io, Socket } from "socket.io-client";

describe("server", () => {
	let client: Socket;

	beforeAll(() => {
		client = io(`http://localhost:4288`);
	});

	afterAll(() => {
		if (client.connected) {
			client.disconnect();
		}
		client.close();
	});

	test("can connect and recieve banner", (done) => {
		expect.assertions(4);

		expect(client.connected).toBe(false);

		client.once("ServerInfo", (msg: ServerInfoMessage) => {
			expect(msg.OnlinePlayers).toBeGreaterThanOrEqual(0);
			expect(msg.Time).toBeGreaterThanOrEqual(0);
			done();
		});

		client.on("connect", () => {
			try {
				expect(client.connected).toBe(true);
			} catch (error) {
				done(error);
			}
		});
	});

});
