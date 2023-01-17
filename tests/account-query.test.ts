import { Socket } from "socket.io-client";
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
		client = new Client(DB)
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

	describe('given a valid account', () => {
		beforeEach(async () => {
			await client.createAccount();
			// await client.loginAccount();
		});

		test('can query online friends', (done) => {
			expect.assertions(2);

			expect(client.isConnected()).toBe(true);

			client.socket.on('AccountQueryResult', (reply) => {
				expect(reply).toMatchObject({
					Query: 'OnlineFriends',
					Result: [],
				});
				done();
			})

			client.socket.emit('AccountQuery', { Query: 'OnlineFriends' });
		});

		test('can query email linking status', (done) => {
			expect.assertions(2);

			expect(client.isConnected()).toBe(true);

			client.socket.on('AccountQueryResult', (reply) => {
				expect(reply).toMatchObject({
					Query: 'EmailStatus',
					Result: true,
				});
				done();
			})

			client.socket.emit('AccountQuery', { Query: 'EmailStatus' });
		});
	});

	describe('given a valid account with no email', () => {
		beforeEach(async () => {
			client.generateAccount();
			client.account.Email = "";
			await client.createAccount();
			// await client.loginAccount();
		});

		test('can query email linking status', (done) => {
			expect.assertions(2);

			expect(client.isConnected()).toBe(true);

			client.socket.on('AccountQueryResult', (reply) => {
				expect(reply).toMatchObject({
					Query: 'EmailStatus',
					Result: false,
				});
				done();
			})

			client.socket.emit('AccountQuery', { Query: 'EmailStatus' });
		});
	});
});
