import { Client } from "./client";
import { DbClient } from "./db";
import { generateAccount } from "./fake";
import { sleep } from "./helpers";

describe("client", () => {

	// Database connection
	let DB: DbClient;
	beforeAll(async () => {
		DB = await DbClient.connectDatabase();
	});

	afterAll(async () => {
		await DB.disconnect();
	});

	/** @type {Client} */
	let client: Client;
	beforeEach(async () => {
		client = new Client(DB);
		await client.connect();
	});

	afterEach(() => {
		if (client.isConnected()) {
			client.disconnect();
		}
		client.cleanupAccount();
		// @ts-ignore
		client = null;
	});

	describe('with a valid account', () => {
		beforeEach(async () => {
			await client.createAccount();
		});

		test.each([
			["Inventory", undefined, ['Item1', 'Item2']],
			["ItemPermission", undefined, 3],
			["ArousalSettings", undefined, { Enabled: true }],
			["OnlineSharedSettings", undefined, { Online: true }],
			["Game", undefined, "Game"],
			["LabelColor", undefined, "#000000"],
			["Appearance", undefined, ['Item1', 'Item2']],
			["Reputation", undefined, 200],
			["Description", undefined, "My description"],
			["BlockItems", undefined, ["test"]],
			["LimitedItems", undefined, ["test"]],
			["FavoriteItems", undefined, ["test"]],
			["WhiteList", undefined, [1]],
			["BlackList", undefined, [1]],
			["FriendList", undefined, [1]],
			["Title", undefined, "New"],
		])('can update %s', async (key, before, after) => {
			expect(client.isConnected()).toBe(true);

			const data = {}
			// @ts-ignore
			data[key] = after;
			await client.socket.emit('AccountUpdate', data);

			/* FIXME: server reply seems to happen before the update is made to the DB */
			await sleep(15);

			const account = await DB.database.collection('Accounts').findOne({ AccountName: client.account.AccountName });
			expect(account[key]).not.toStrictEqual(before);
			expect(account[key]).toStrictEqual(after);
		});

		/* TODO: Some of the above send a ChatRoomSyncCharacter message */
		/* TODO: Lover sends a AccountLovership message */

		/* FIXME: Some of these would require a peek at the account after login */
		test.each([
			["Name", () => client.account.Name, "Invalid"],
			["AccountName", () => client.account.AccountName, "Invalid"],
			// ["Password", undefined, undefined],
			["Email", () => client.account.Email, "Invalid"],
			// ["Creation", undefined, undefined],
			// ["LastLogin", undefined, undefined],
			["Pose", undefined, "Invalid"],
			["ActivePose", undefined, "Invalid"],
			["ChatRoom", undefined, "Invalid"],
			// ["ID", undefined, undefined],
			// ["MemberNumber", undefined, undefined],
			["Environment", undefined, "Invalid"],
			["Ownership", undefined, "Invalid"],
			["Lovership", [], "Invalid"],
			["Difficulty", undefined, 3],
		])('can\'t update %s', async (key, before, after) => {
			expect(client.isConnected()).toBe(true);

			const dynamicBefore = typeof before === "function" ? before() : before;
			const data = {}
			// @ts-ignore
			data[key] = after;

			await client.socket.emit('AccountUpdate', data);

			/* FIXME: server reply seems to happen before the update is made to the DB */
			await sleep(15);

			const account = await DB.database.collection('Accounts').findOne({ AccountName: client.account.AccountName });
			expect(account[key]).not.toStrictEqual(after);
			expect(account[key]).toStrictEqual(dynamicBefore);
		});

		describe('can update its email', () => {
			test("if it matches the previous email", (done) => {
				const data = { EmailOld: client.account.Email, EmailNew: "new@example.com" };
				let duplicateReply = 0;

				expect.assertions(4);

				expect(client.isConnected()).toBe(true);

				client.socket.on('AccountQueryResult', async (result) => {
					duplicateReply++;
					if (duplicateReply == 1) {
						/*
						 * FIXME: server first sends a `Result: false` because of an invalid fallthrough,
						 * swallow it.
						 */
						expect(result).toMatchObject({
							Query: 'EmailUpdate',
							Result: false,
						});
						return;
					}

					expect(result).toMatchObject({
						Query: 'EmailUpdate',
						Result: true,
					});
					await sleep(15);

					const account = await DB.database.collection('Accounts').findOne({ AccountName: client.account.AccountName });
					expect(account.Email).toBe('new@example.com');

					if (duplicateReply == 2)
						done();
				});

				client.socket.emit('AccountUpdateEmail', data);
			});

			test("unless it's not the previous email", (done) => {
				const data = { EmailOld: 'random@example.com', EmailNew: "new@example.com" };

				expect.assertions(3);

				expect(client.isConnected()).toBe(true);

				client.socket.on('AccountQueryResult', async (result) => {
					expect(result).toMatchObject({
						Query: 'EmailUpdate',
						Result: false,
					});
					await sleep(15);

					const account = await DB.database.collection('Accounts').findOne({ AccountName: client.account.AccountName });
					expect(account.Email).toBe(client.account.Email);
					done();
				});

				client.socket.emit('AccountUpdateEmail', data);
			});
		});
	});
});
