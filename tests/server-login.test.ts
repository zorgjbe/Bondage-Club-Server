import { Client } from "./client";
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

	let client: Client;
	beforeEach(async () => {
		client = new Client(DB);
		await client.connect();
		client.generateAccount();
		await DB.createAccount(client.account.AccountName, client.account.Password, client.account.Name, client.account.Email);
	});

	afterEach(async () => {
		if (client.isConnected()) {
			client.disconnect();
		}
		await client.cleanupAccount();
		// @ts-ignore
		client = null;
	});

	describe('with a valid account', () => {

		test("can login", (done) => {
			expect.assertions(2);

			expect(client.isConnected()).toBe(true);

			client.loginAccount(client.account.AccountName, client.account.Password)
				.catch((err) => { done(err) })
				.then((account) => {
					expect(account).toMatchObject({
						AccountName: client.account.AccountName,
						Name: client.account.Name,
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

		test("can't login with an incorrect password", (done) => {
			expect.assertions(2);

			expect(client.isConnected()).toBe(true);

			client.loginAccount(client.account.AccountName, "not the correct password")
				.catch((err: Error) => {
					expect(err.message).toBe('Failed to login account '+client.account.AccountName);
					done() });
		});
	});

});
