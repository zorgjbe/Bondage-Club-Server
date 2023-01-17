import { Socket } from "socket.io-client";
import { Client } from "./client";
import { DbClient } from "./db";
import { generateAccount, generateChatroom } from "./fake";

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

	describe('given a valid account', () => {
		beforeEach(async () => {
			await client.createAccount();
		});

		test("can create chatrooms with minimal data", (done) => {
			expect.assertions(2);

			const chatroomData = {
				Name: "My chatroom",
				Description: "",
				Background: "",
				Private: false,
			}

			expect(client.isConnected()).toBe(true);

			client.socket.on("ChatRoomCreateResponse", (reply) => {
				expect(reply).toBe("ChatRoomCreated");
				done();
			});

			client.socket.emit("ChatRoomCreate", chatroomData);
		});

		it("errors if name is too long", (done) => {
			expect.assertions(2);

			const chatroomData = {
				Name: "A pretty nice chatroom it is",
				Description: "",
				Background: "",
				Private: false,
			}

			expect(client.isConnected()).toBe(true);

			client.socket.on("ChatRoomCreateResponse", (reply) => {
				expect(reply).toBe("InvalidRoomData");
				done();
			});

			client.socket.emit("ChatRoomCreate", chatroomData);
		});

		it("errors if background is too long", (done) => {
			expect.assertions(2);

			const chatroomData = {
				Name: "A chatroom",
				Description: "",
				Background: "a".repeat(101),
				Private: false,
			}

			expect(client.isConnected()).toBe(true);

			client.socket.on("ChatRoomCreateResponse", (reply) => {
				expect(reply).toBe("InvalidRoomData");
				done();
			});

			client.socket.emit("ChatRoomCreate", chatroomData);
		});

		describe('and an already existing chatroom', () => {

			let client2: Client;
			let testChatroom: ServerChatRoomCreateData | null = null;
			beforeEach(async () => {
				client2 = new Client(DB);
				await client2.createAccount();

				testChatroom = generateChatroom();
				await client2.createChatroom(testChatroom);
			});

			afterEach(() => {
				if (client2.isConnected()) {
					client2.disconnect();
				}
				client2.cleanupAccount();
				// @ts-ignore
				client2 = null;
			});

			it('fails to create a duplicate chatroom', (done) => {
				expect.assertions(2);

				const chatroomData = {
					Name: testChatroom!.Name,
					Description: "",
					Background: "",
					Private: false,
				}

				expect(client.isConnected()).toBe(true);

				client.socket.on("ChatRoomCreateResponse", (reply) => {
					expect(reply).toBe("RoomAlreadyExist");
					done();
				});

				client.socket.emit("ChatRoomCreate", chatroomData);
			});
		});
	});
});
