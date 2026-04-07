import type * as v from "valibot";
import { describe, expectTypeOf, it } from "vitest";
import type { InferRFC9457ResponseBodyPerStatus } from "./rfc9457";

describe("InferRFC9457ResponsePerStatus", () => {
	it("should infer the response body type per status", () => {
		expectTypeOf<
			InferRFC9457ResponseBodyPerStatus<
				| {
						status: 400;
						title: "resourceNotFound";
						description: "Foo error";
				  }
				| {
						status: 400;
						title: "fooError";
						description: "Foo error";
						specificSchema: v.GenericSchema<{
							whatIsFoo: string;
						}>;
				  }
				| {
						status: 400;
						title: "barError";
						description: "Bar error";
						specificSchema: v.GenericSchema<{
							whatIsBar: string;
						}>;
				  }
				| {
						status: 401;
						title: "unauthorized";
						description: "Unauthorized";
						specificSchema: never;
				  }
			>
		>().toExtend<{
			400: {
				title: "resourceNotFound" | "fooError" | "barError";
				detail: string;
				fooErrorAttribute: {
					whatIsFoo: string;
				} | null;
				barErrorAttribute: {
					whatIsBar: string;
				} | null;
			};
			401: {
				title: "unauthorized";
				detail: string;
			};
		}>();
	});
});
