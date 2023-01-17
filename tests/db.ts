import { Db, MongoClient } from "mongodb";

import * as BCrypt from "bcrypt";

export class DbClient {

	client: MongoClient;
	database: Db;

	constructor(client: MongoClient, database: Db) {
		this.client = client;
		this.database = database;	
	}

	static async connectDatabase() {
		const client = await MongoClient.connect(process.env.TEST_DATABASE_URL as string, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		const database = await client.db(process.env.DATABASE_NAME);
		console.info(`Connected to ${process.env.TEST_DATABASE_URL}/${process.env.DATABASE_NAME}`);
		
		return new this(client, database);
	}

	async disconnect() {
		this.client.close();
	}

	async createAccount(account: string, password: string, username: string, email: string) {
		const hash = await BCrypt.hash(password.toUpperCase(), 10);

		let data = {
			AccountName: account,
			Name: username,
			Email: email,
			Password: hash,
			Money: 100,
			Creation: new Date().getTime(),
			LastLogin: new Date().getTime(),
			Lovership: [],
		}

		return await this.database.collection("Accounts").insertOne(data);
	}
}
