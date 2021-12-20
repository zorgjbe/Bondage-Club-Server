import { io, Socket } from "socket.io-client";

describe("server", () => {
	let client: Socket;

	beforeAll((done) => {
		client = io(`http://localhost:4288`);
		client.on("connect", done);
	});

	afterAll(() => {
		client.close();
	});

	test("can connect", (done) => {
		expect(client.connected).toBe(true);
		done();
	});
});
