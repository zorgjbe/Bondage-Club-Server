import { io, Socket } from "socket.io-client";
import { Club } from "./client";
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

	describe('with a valid account', () => {
		beforeEach(async () => {
			await DB.createAccount(testAccount.AccountName, testAccount.Password, testAccount.Name, testAccount.Email);
			await Club.loginAccount(client, testAccount.AccountName, testAccount.Password);
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
			const data = {}
			// @ts-ignore
			data[key] = after;
			await client.emit('AccountUpdate', data);

			/* FIXME: server reply seems to happen before the update is made to the DB */
			await sleep(15);

			const account = await DB.database.collection('Accounts').findOne({ AccountName: testAccount.AccountName });
			expect(account[key]).not.toStrictEqual(before);
			expect(account[key]).toStrictEqual(after);
		});

		/* TODO: Some of the above send a ChatRoomSyncCharacter message */
		/* TODO: Lover sends a AccountLovership message */

		/* FIXME: Some of these would require a peek at the account after login */
		test.each([
			["Name", () => testAccount.Name, "Invalid"],
			["AccountName", () => testAccount.AccountName, "Invalid"],
			// ["Password", undefined, undefined],
			["Email", () => testAccount.Email, "Invalid"],
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
			const dynamicBefore = typeof before === "function" ? before() : before;
			const data = {}
			// @ts-ignore
			data[key] = after;


			await client.emit('AccountUpdate', data);

			/* FIXME: server reply seems to happen before the update is made to the DB */
			await sleep(15);

			const account = await DB.database.collection('Accounts').findOne({ AccountName: testAccount.AccountName });
			expect(account[key]).not.toStrictEqual(after);
			expect(account[key]).toStrictEqual(dynamicBefore);
		});

		describe('can update its email', () => {
			test("if it matches the previous email", (done) => {
				const data = { EmailOld: testAccount.Email, EmailNew: "new@example.com" };
				let duplicateReply = 0;

				expect.assertions(4);

				client.on('AccountQueryResult', async (result) => {
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

					const account = await DB.database.collection('Accounts').findOne({ AccountName: testAccount.AccountName });
					expect(account.Email).toBe('new@example.com');

					if (duplicateReply == 2)
						done();
				});

				client.emit('AccountUpdateEmail', data);
			});

			test("unless it's not the previous email", (done) => {
				const data = { EmailOld: 'random@example.com', EmailNew: "new@example.com" };

				expect.assertions(3);

				client.on('AccountQueryResult', async (result) => {
					expect(result).toMatchObject({
						Query: 'EmailUpdate',
						Result: false,
					});
					await sleep(15);

					const account = await DB.database.collection('Accounts').findOne({ AccountName: testAccount.AccountName });
					expect(account.Email).toBe(testAccount.Email);
					done();
				});

				client.emit('AccountUpdateEmail', data);
			});
		});
	});
});
