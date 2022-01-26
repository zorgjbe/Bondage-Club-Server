import { Socket } from "socket.io-client";
import { Club } from "./client";
import { DbClient } from "./db";
import { generateAccount } from "./fake";

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
	beforeEach(async () => {
		client = await Club.createClient();
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
