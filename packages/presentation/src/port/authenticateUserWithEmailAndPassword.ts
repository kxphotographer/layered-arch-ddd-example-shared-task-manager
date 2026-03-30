import type { User } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";

export type AuthenticateUserWithEmailAndPassword = (
	params: Readonly<{
		email: string;
		password: string;
	}>,
) => Promise<
	Result<
		{ user: User },
		{ kind: "userWithEmailNotFound" } | { kind: "passwordMismatch" }
	>
>;
