import { describe, expectTypeOf, it } from "vitest";
import type {
	ExtractFailureResult,
	ExtractSuccessResult,
	Result,
} from "./result";

describe("Result", () => {
	it("should have error type if error type is provided", () => {
		const successValue = Symbol();
		const errorValue = Symbol();

		expectTypeOf<
			Result<typeof successValue, typeof errorValue>
		>().toEqualTypeOf<
			| {
					success: true;
					value: typeof successValue;
			  }
			| {
					success: false;
					error: typeof errorValue;
			  }
		>();
	});

	it("should not have error type if error type is omitted", () => {
		const successValue = Symbol();

		expectTypeOf<Result<typeof successValue>>().toEqualTypeOf<{
			success: true;
			value: typeof successValue;
		}>();
	});
});

describe("ExtractSuccessResult", () => {
	it("should extract the success type from the result", () => {
		const successValue = Symbol();
		const errorValue = Symbol();

		type ResultType = Result<typeof successValue, typeof errorValue>;

		expectTypeOf<ExtractSuccessResult<ResultType>>().toEqualTypeOf<{
			success: true;
			value: typeof successValue;
		}>();
	});
});

describe("ExtractFailureResult", () => {
	it("should extract the error type from the result", () => {
		const successValue = Symbol();
		const errorValue = Symbol();

		type ResultType = Result<typeof successValue, typeof errorValue>;

		expectTypeOf<ExtractFailureResult<ResultType>>().toEqualTypeOf<{
			success: false;
			error: typeof errorValue;
		}>();
	});
});
