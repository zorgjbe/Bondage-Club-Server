import { faker } from "@faker-js/faker";
import _ from "lodash";

export function generateAccount(data?: Partial<ServerAccount>): ServerAccount {
	let firstName = null;
	let lastName = null;
	let name = null;
	do {
		firstName = faker.name.firstName();
		lastName = faker.name.lastName();
		name = `${firstName} ${lastName}`;
	} while (name.length > 20);

	const random = {
		Name: name,
		AccountName: firstName.toUpperCase(),
		Password: faker.internet.password(15, false, /[A-Za-z0-9]/),
		Email: faker.internet.exampleEmail(firstName, lastName),
	};
	return {...random, ...data};
}
export function generateChatroom(data?: ServerChatRoomCreateData): ServerChatRoomCreateData {
	let random = {
		Name: `${faker.lorem.word(5)} ${faker.lorem.word(5)} ${faker.lorem.word(5)}`,
		Description: faker.hacker.phrase().substring(0, 100),
		Background: "",
		Private: faker.datatype.boolean(),
		Space: _.sample(["", "Asylum"]),
	}
	return {...random, ...data};
}
