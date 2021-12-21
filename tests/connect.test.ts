import { io, Socket } from "socket.io-client";

describe("server", () => {
	let client: Socket;

	beforeAll((done) => {
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

		client.once("ServerMessage", (msg) => {
			expect(msg).toBe('Connected to the Bondage Club Server.');
			client.once("ServerMessage", (msg) => {
				expect(msg).toBe('Warning!  Console scripts can break your account or steal your data.');
				done();
			});
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
