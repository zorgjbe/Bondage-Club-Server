import { io, Socket } from "socket.io-client";

describe("server", () => {
	let client: Socket;

	beforeEach((done) => {
		client = io(`http://localhost:4288`);
		client.on("connect", () => {
			expect(client.connected).toBe(true);
			done();
		});
	});

	afterEach(() => {
		if (client.connected) {
			client.disconnect();
		}
		client.close();
	});

	test("can create accounts", (done) => {
		const accountData = {
			Name: "Test",
			AccountName: "TESTACCOUNT",
			Password: "thisisabadpassword",
			Email: "example@example.org"
		};
		expect.assertions(2);

		client.on("CreationResponse", (arg) => {
			expect(arg).toMatchObject({
				MemberNumber: expect.any(Number),
				OnlineID: expect.any(String),
				ServerAnswer: "AccountCreated",
			});
			done();
		});

		client.emit("AccountCreate", accountData);
	});

	// FIXME: This one actually causes a null-response from server
	xtest("can create accounts without an email", (done) => {
		const accountData = {
			Name: "Test",
			AccountName: "TESTACCOUNT",
			Password: "thisisabadpassword",
			Email: "",
		};
		expect.assertions(2);

		client.on("CreationResponse", (arg) => {
			expect(arg).toMatchObject({
				MemberNumber: expect.any(Number),
				OnlineID: expect.any(String),
				ServerAnswer: "AccountCreated",
			});
			done();
		});

		client.emit("AccountCreate", accountData);
	});

	test("fails to create account with no data", (done) => {
		expect.assertions(2);

		client.on("CreationResponse", (arg) => {
			expect(arg).toBe('Invalid account information');
			done();
		});

		client.emit("AccountCreate", null);
	});

});
