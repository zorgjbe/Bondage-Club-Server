import { io, Socket } from "socket.io-client";
import { Club } from "./client";
import { DbClient } from "./db";

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
	beforeEach(() => {
		const accounts = DB.database.collection('Accounts');
		accounts.deleteMany({ AccountName: "TESTACCOUNT" });
	});
	afterEach(() => {
		const accounts = DB.database.collection('Accounts');
		accounts.deleteMany({ AccountName: "TESTACCOUNT" });
	});

	describe('with a valid account', () => {

		const accountData = {
			Name: "Test",
			AccountName: "TESTACCOUNT",
			Password: "thisisabadpassword",
			Email: "example@example.org"
		};

		beforeEach(async () => {
			await DB.createAccount(accountData.AccountName, accountData.Password, accountData.Name, accountData.Email);
		});

		test("can login", (done) => {
			expect.assertions(2);

			Club.loginAccount(client, accountData.AccountName, accountData.Password)
				.catch((err) => { done(err) })
				.then((account) => {
					expect(account).toMatchObject({
						AccountName: accountData.AccountName,
						Name: accountData.Name,
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

		const accountData = {
			Name: "Test",
			AccountName: "TESTACCOUNT",
			Password: "thisisabadpassword",
			Email: "example@example.org"
		};

		beforeEach(async () => {
			await DB.createAccount(accountData.AccountName, accountData.Password, accountData.Name, accountData.Email);
		});

		test("can't login with an incorrect password", (done) => {
			expect.assertions(2);

			Club.loginAccount(client, accountData.AccountName, "not the correct password")
				.catch((err) => { done(err) })
				.then((account) => {
					expect(account).toBe("InvalidNamePassword");
					done();
				});
		});
	});

});
