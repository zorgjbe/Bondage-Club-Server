import { Client } from "./client";
import { DbClient } from "./db";

describe("server", () => {

	// Database connection
	let DB: DbClient;
	beforeAll(async () => {
		DB = await DbClient.connectDatabase();
	});

	afterAll(async () => {
		DB.disconnect();
	});

	let client: Client;
	beforeEach(async () => {
		client = new Client(DB);
		await client.connect();
	});

	afterEach(async () => {
		if (client.isConnected()) {
			client.disconnect();
		}
		await client.cleanupAccount();
		// @ts-ignore
		client = null;
	});

	test("can create accounts", async () => {
		expect.assertions(2);

		expect(client.isConnected()).toBe(true);

		const reply = await client.createAccount();
		expect(reply).toMatchObject({
			MemberNumber: expect.any(Number),
			OnlineID: expect.any(String),
			ServerAnswer: "AccountCreated",
		});
	});

	// FIXME: This one actually causes a null-response from server
	xtest("can create accounts without an email", async () => {
		expect.assertions(2);
		client.account!.Email = "";

		expect(client.isConnected()).toBe(true);

		const reply = await client.createAccount();
		expect(reply).toMatchObject({
			MemberNumber: expect.any(Number),
			OnlineID: expect.any(String),
			ServerAnswer: "AccountCreated",
		});
	});

	test("fails to create account with no data", (done) => {
		expect.assertions(2);

		expect(client.isConnected()).toBe(true);

		client.socket.on("CreationResponse", (arg: any) => {
			expect(arg).toBe('Invalid account information');
			done();
		});

		client.socket.emit("AccountCreate", null);
	});

});
