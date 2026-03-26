/**
 * Utility class for making conditional branches exhaustive on type system.
 *
 * @example
 * ```ts
 * const value = Math.random() > 0.5 ? "a" as const : "b" as const;
 *
 * switch (value) {
 *     case "a":
 *         console.log("a");
 *         break;
 *     default:
 *         throw new UnreachableCase(value);
 *     //                            ^^^^^ Type error because "b" is not covered
 * }
 *
 * switch (value) {
 *     case "a":
 *         console.log("a");
 *         break;
 * 　　case "b":
 *         console.log("b");
 *         break;
 *     default:
 *         throw new UnreachableCase(value); // No type error, means exhaustive
 * }
 */
export class UnreachableCase extends Error {
	constructor(value: never) {
		super(
			`Called even though the part is unreachable on type system: ${JSON.stringify(value)}`,
		);
	}
}
