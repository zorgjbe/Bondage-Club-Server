import { faker } from "@faker-js/faker";

export function generateAccount(): ServerAccount {
	return {
		Name: faker.name.fullName(),
		AccountName: faker.name.firstName().toUpperCase(),
		Password: faker.internet.password(),
		Email: faker.internet.exampleEmail()
	};
}

export function generateChatroom() {
	return {
		Name: faker.lorem.word(8),
		Description: faker.hacker.phrase(),
		Background: "",
		Private: faker.datatype.boolean(),
	}
}
