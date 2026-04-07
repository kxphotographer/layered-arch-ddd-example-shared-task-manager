import type { User } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";

export type FetchUserByEmail<Transaction> = (
	params: Readonly<{
		transaction?: Transaction;
		email: string;
	}>,
) => Promise<Result<{ user: User }, { kind: "userNotFound" }>>;
