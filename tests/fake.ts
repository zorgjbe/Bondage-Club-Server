import { faker } from "@faker-js/faker";

export function generateAccount(): ServerAccount {
	return {
		Name: faker.name.fullName(),
		AccountName: faker.name.firstName().toUpperCase(),
		Password: faker.internet.password(),
		Email: faker.internet.exampleEmail()
	};
}
