import { Socket } from "socket.io-client";
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
	beforeEach(async () => {
		client = await Club.createClient()
	});

	afterEach(() => {
		if (client.connected) {
			client.disconnect();
		}
		client.close();
		// @ts-ignore
		client = null;
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

	describe('with a valid account', () => {

		beforeEach(async () => {
			await DB.createAccount(testAccount.AccountName, testAccount.Password, testAccount.Name, testAccount.Email);
		});

		test("can login", (done) => {
			expect.assertions(2);

			expect(client.connected).toBe(true);

			Club.loginAccount(client, testAccount.AccountName, testAccount.Password)
				.catch((err) => { done(err) })
				.then((account) => {
					expect(account).toMatchObject({
						AccountName: testAccount.AccountName,
						Name: testAccount.Name,
						Money: expect.any(Number),
						Creation: expect.any(Number),
						LastLogin: expect.any(Number),
						Lovership: expect.any(Array),
						MemberNumber: expect.any(Number),
						ID: expect.any(String),
						Environment: expect.any(String),
						ItemPermission: expect.any(Number),
						WhiteList: expect.any(Array),
						BlackList: expect.any(Array),
						FriendList: expect.any(Array),
					});
					done();
				});
		});
	});

	describe('with an valid account', () => {

		beforeEach(async () => {
			await DB.createAccount(testAccount.AccountName, testAccount.Password, testAccount.Name, testAccount.Email);
		});

		test("can't login with an incorrect password", (done) => {
			expect.assertions(2);

			expect(client.connected).toBe(true);

			Club.loginAccount(client, testAccount.AccountName, "not the correct password")
				.catch((err) => { done(err) })
				.then((account) => {
					expect(account).toBe("InvalidNamePassword");
					done();
				});
		});
	});

});
