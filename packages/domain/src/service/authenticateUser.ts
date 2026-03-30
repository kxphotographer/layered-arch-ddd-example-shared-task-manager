import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import type { User } from "@/entity";
import type { Port } from "@/port";

export const authenticateUserWithEmailAndPassword =
	<Transaction>(injected: Port<Transaction, "comparePassword">) =>
	async (
		user: User,
		params: Readonly<{
			email: string;
			password: string;
		}>,
	): Promise<
		Result<
			undefined,
			{ kind: "noCredentialFound" } | { kind: "passwordMismatch" }
		>
	> => {
		const credential = user.credentials.find(
			(credential) =>
				credential.type === "emailPassword" &&
				credential.email === params.email,
		);
		if (!credential) {
			return {
				success: false,
				error: {
					kind: "noCredentialFound",
				},
			};
		}

		if (
			!(await injected.comparePassword({
				password: params.password,
				passwordHash: credential.passwordHash,
			}))
		) {
			return {
				success: false,
				error: {
					kind: "passwordMismatch",
				},
			};
		}

		return {
			success: true,
			value: undefined,
		};
	};
