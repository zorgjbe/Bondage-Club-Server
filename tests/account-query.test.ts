import { io, Socket } from "socket.io-client";
import { Club } from "./client";
import { DbClient } from "./db";
import { generateAccount } from "./fake";

describe("client", () => {

	// Database connection
	let DB: DbClient;
	beforeAll(async () => {
		DB = await DbClient.connectDatabase();
	});

	afterAll(async () => {
		await DB.disconnect();
	});

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
	beforeEach(async () => {
		const accounts = DB.database.collection('Accounts');
		testAccount = generateAccount();
		await accounts.deleteMany({ AccountName: testAccount.AccountName });
	});
	afterEach(async () => {
		const accounts = DB.database.collection('Accounts');
		await accounts.deleteMany({ AccountName: testAccount.AccountName });
	});

	describe('given a valid account', () => {
		beforeEach(async () => {
			await DB.createAccount(testAccount.AccountName, testAccount.Password, testAccount.Name, testAccount.Email);
			await Club.loginAccount(client, testAccount.AccountName, testAccount.Password);
		});

		test('can query online friends', (done) => {
			expect.assertions(2);

			client.on('AccountQueryResult', (reply) => {
				expect(reply).toMatchObject({
					Query: 'OnlineFriends',
					Result: [],
				});
				done();
			})

			client.emit('AccountQuery', { Query: 'OnlineFriends' });
		});

		test('can query email linking status', (done) => {
			expect.assertions(2);

			client.on('AccountQueryResult', (reply) => {
				expect(reply).toMatchObject({
					Query: 'EmailStatus',
					Result: true,
				});
				done();
			})

			client.emit('AccountQuery', { Query: 'EmailStatus' });
		});
	});

	describe('given a valid account with no email', () => {
		beforeEach(async () => {
			testAccount.Email = "";
			await DB.createAccount(testAccount.AccountName, testAccount.Password, testAccount.Name, testAccount.Email);
			await Club.loginAccount(client, testAccount.AccountName, testAccount.Password);
		});

		test('can query email linking status', (done) => {
			expect.assertions(2);

			client.on('AccountQueryResult', (reply) => {
				expect(reply).toMatchObject({
					Query: 'EmailStatus',
					Result: false,
				});
				done();
			})

			client.emit('AccountQuery', { Query: 'EmailStatus' });
		});
	});
});
