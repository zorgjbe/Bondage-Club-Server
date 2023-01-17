import { io, Socket } from "socket.io-client";
import { Club } from "./client";
import { DbClient } from "./db";

describe("server", () => {

	// Database connection
	let DB: DbClient;
	beforeAll(async () => {
		DB = await DbClient.connectDatabase();
	});

	afterAll(async () => {
		await DB.disconnect();
	});

	// API client
	let client: Socket;
	beforeEach((done) => {
		client = io(`http://localhost:4288`);
		client.on("connect", () => {
			done();
		});
	});

	afterEach(() => {
		if (client.connected) {
			client.disconnect();
		}
		client.close();
	});

	const testAccount = {
		Name: "Test",
		AccountName: "TESTACCOUNT",
		Password: "thisisabadpassword",
		Email: "example@example.org"
	};
	// Test user cleanup
	beforeEach(() => {
		const accounts = DB.database.collection('Accounts');
		accounts.deleteMany({ AccountName: testAccount.AccountName });
	});
	afterEach(() => {
		const accounts = DB.database.collection('Accounts');
		accounts.deleteMany({ AccountName: testAccount.AccountName });
	});

	describe('given a valid account', () => {
		beforeEach(async () => {
			await DB.createAccount(testAccount.AccountName, testAccount.Password, testAccount.Name, testAccount.Email);
			await Club.loginAccount(client, testAccount.AccountName, testAccount.Password);
		});

		test("can create chatrooms with minimal data", (done) => {
			expect.assertions(2);

			const chatroomData = {
				Name: "My chatroom",
				Description: "",
				Background: "",
				Private: false,
			}

			expect(client.connected).toBe(true);

			client.on("ChatRoomCreateResponse", (reply) => {
				expect(reply).toBe("ChatRoomCreated");
				done();
			});

			client.emit("ChatRoomCreate", chatroomData);
		});
	});
});
