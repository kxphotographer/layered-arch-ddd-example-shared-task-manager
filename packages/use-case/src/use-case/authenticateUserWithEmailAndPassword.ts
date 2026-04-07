import type { DomainService } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import type { AuthenticateUserWithEmailAndPassword } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-presentation";
import { UnreachableCase } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import type { Port } from "@/port";

export const authenticateUserWithEmailAndPassword =
	<Transaction>(
		injected: Port<Transaction, "fetchUserByEmail"> &
			DomainService<Transaction, "authenticateUserWithEmailAndPassword">,
	): AuthenticateUserWithEmailAndPassword =>
	async (params) => {
		const userFetchResult = await injected.fetchUserByEmail({
			email: params.email,
		});
		if (!userFetchResult.success) {
			switch (userFetchResult.error.kind) {
				case "userNotFound": {
					return {
						success: false,
						error: {
							kind: "userWithEmailNotFound",
						},
					};
				}
				default: {
					throw new UnreachableCase(userFetchResult.error.kind);
				}
			}
		}

		const user = userFetchResult.value.user;

		const authenticateUserResult =
			await injected.authenticateUserWithEmailAndPassword(user, {
				email: params.email,
				password: params.password,
			});

		if (!authenticateUserResult.success) {
			switch (authenticateUserResult.error.kind) {
				case "noCredentialFound": {
					throw new Error(
						"User credential with specified email must be present as the user is found by email",
					);
				}
				case "passwordMismatch": {
					return {
						success: false,
						error: {
							kind: "passwordMismatch",
						},
					};
				}
				default: {
					throw new UnreachableCase(authenticateUserResult.error);
				}
			}
		}

		return {
			success: true,
			value: {
				user,
			},
		};
	};
