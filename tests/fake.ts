import { faker } from "@faker-js/faker";
import _ from "lodash";

export function generateAccount(): ServerAccount {
	return {
		Name: faker.name.fullName(),
		AccountName: faker.name.firstName().toUpperCase(),
		Password: faker.internet.password(),
		Email: faker.internet.exampleEmail()
	};
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
