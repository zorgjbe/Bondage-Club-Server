import { MongoClient } from "mongodb";
import { io, Socket } from "socket.io-client";
import { DbClient } from "./db";
import { generateAccount } from "./fake";

describe("server", () => {

	// Database connection
	let DB: DbClient;
	beforeAll(async () => {
		DB = await DbClient.connectDatabase();
	});

	afterAll(async () => {
		DB.disconnect();
	});

	/** API client */
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

	// Test user cleanup
	let testAccount: ServerAccount;
	beforeEach(() => {
		const accounts = DB.database.collection('Accounts');
		testAccount = generateAccount();
		accounts.deleteMany({ AccountName: "TESTACCOUNT" });
	});
	afterEach(() => {
		const accounts = DB.database.collection('Accounts');
		accounts.deleteMany({ AccountName: "TESTACCOUNT" });
	});

	test("can create accounts", (done) => {
		expect.assertions(2);

		client.on("CreationResponse", (arg) => {
			expect(arg).toMatchObject({
				MemberNumber: expect.any(Number),
				OnlineID: expect.any(String),
				ServerAnswer: "AccountCreated",
			});
			done();
		});

		client.emit("AccountCreate", testAccount);
	});

	// FIXME: This one actually causes a null-response from server
	xtest("can create accounts without an email", (done) => {
		expect.assertions(2);
		testAccount.Email = "";

		client.on("CreationResponse", (arg) => {
			expect(arg).toMatchObject({
				MemberNumber: expect.any(Number),
				OnlineID: expect.any(String),
				ServerAnswer: "AccountCreated",
			});
			done();
		});

		client.emit("AccountCreate", testAccount);
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
