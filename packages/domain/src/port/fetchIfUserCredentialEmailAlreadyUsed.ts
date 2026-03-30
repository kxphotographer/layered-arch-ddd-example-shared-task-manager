import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";

export type FetchIfUserCredentialEmailAlreadyUsed<Transaction> = (
	params: Readonly<{
		email: string;
		transaction?: Transaction;
	}>,
) => Promise<
	Result<{
		exists: boolean;
	}>
>;
