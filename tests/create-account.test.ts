import { io, Socket } from "socket.io-client";
import { Db, MongoClient } from "mongodb";

describe("server", () => {

	/** Database connection */
	let mongodb: MongoClient;
	let database: Db
	beforeAll(async () => {
		mongodb = await MongoClient.connect(process.env.TEST_DATABASE_URL as string, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		});
		database = await mongodb.db(process.env.DATABASE_NAME);
	});

	afterAll(async () => {
		await mongodb.close();
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
	beforeEach(() => {
		const accounts = database.collection('Accounts');
		accounts.deleteMany({ AccountName: "TESTACCOUNT" });
	});
	afterEach(() => {
		const accounts = database.collection('Accounts');
		accounts.deleteMany({ AccountName: "TESTACCOUNT" });
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
