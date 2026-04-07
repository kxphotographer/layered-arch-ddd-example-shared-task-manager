import { faker } from "@faker-js/faker";
import { Hono } from "hono";
import { describeRoute, generateSpecs, resolver } from "hono-openapi";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	type InferRFC9457ResponseBodyPerStatus,
	type RFC9457ResponseErrorDefinition,
	rfc9457OpenAPISpecResponses,
	rfc9457ResponseBodySchemaPerStatus,
} from "./rfc9457";

describe("rfc9457ResponsesSchema", () => {
	it("should generate response body schema for each status", () => {
		// Arrange
		const definitions = [
			{
				status: 400,
				title: "invalidValue",
				description: "Invalid value",
			},
			{
				status: 400,
				title: "fooError",
				description: "Foo error",
				specificSchema: v.object({
					whatIsFoo: v.string(),
				}),
			},
			{
				status: 400,
				title: "barError",
				description: "Bar error",
				specificSchema: v.object({
					whatIsBar: v.number(),
				}),
			},
			{
				status: 401,
				title: "unauthorized",
				description: "Unauthorized",
			},
			{
				status: 403,
				title: "permissionDenied",
				description: "Permission denied",
			},
		] as const satisfies Iterable<RFC9457ResponseErrorDefinition>;

		// Act
		const result = rfc9457ResponseBodySchemaPerStatus(definitions);

		// Assert
		expect(Object.keys(result)).toEqual(["400", "401", "403"]);
		expect(() =>
			v.parse(result["400"], {
				title: "invalidValue",
				detail: faker.lorem.sentence(),
				fooErrorAttribute: null,
				barErrorAttribute: null,
			} satisfies InferRFC9457ResponseBodyPerStatus<
				(typeof definitions)[number]
			>["400"]),
		).not.toThrow();
		expect(() =>
			v.parse(result["400"], {
				title: "fooError",
				detail: faker.lorem.sentence(),
				fooErrorAttribute: {
					whatIsFoo: faker.lorem.word(),
				},
				barErrorAttribute: null,
			} satisfies InferRFC9457ResponseBodyPerStatus<
				(typeof definitions)[number]
			>["400"]),
		).not.toThrow();
		expect(() =>
			v.parse(result["400"], {
				title: "barError",
				detail: faker.lorem.sentence(),
				fooErrorAttribute: null,
				barErrorAttribute: {
					whatIsBar: faker.number.int(),
				},
			} satisfies InferRFC9457ResponseBodyPerStatus<
				(typeof definitions)[number]
			>["400"]),
		).not.toThrow();
		expect(() =>
			v.parse(result["401"], {
				title: "unauthorized",
				detail: faker.lorem.sentence(),
			} satisfies InferRFC9457ResponseBodyPerStatus<
				(typeof definitions)[number]
			>["401"]),
		).not.toThrow();
		expect(() =>
			v.parse(result["403"], {
				title: "permissionDenied",
				detail: faker.lorem.sentence(),
			} satisfies InferRFC9457ResponseBodyPerStatus<
				(typeof definitions)[number]
			>["403"]),
		).not.toThrow();
	});
});

describe("rfc9457OpenAPISpecResponses", () => {
	it("should provide metadata for hono-openapi", async () => {
		// Arrange
		const definitions = [
			{
				status: 400,
				title: "invalidValue",
				description: "Invalid value",
			},
			{
				status: 400,
				title: "fooError",
				description: "Foo error",
				specificSchema: v.object({
					whatIsFoo: v.string(),
				}),
			},
			{
				status: 400,
				title: "barError",
				description: "Bar error",
				specificSchema: v.object({
					whatIsBar: v.number(),
				}),
			},
			{
				status: 401,
				title: "unauthorized",
				description: "Unauthorized",
			},
			{
				status: 403,
				title: "permissionDenied",
				description: "Permission denied",
			},
		] as const satisfies Iterable<RFC9457ResponseErrorDefinition>;
		const app = new Hono().get(
			"/endpoint",
			describeRoute({
				summary: "The endpoint",
				responses: {
					200: {
						description: "The response",
						content: {
							"application/json": {
								schema: resolver(
									v.pipe(
										v.object({
											message: v.pipe(v.string(), v.description("The message")),
										}),
										v.description("The object"),
									),
								),
							},
						},
					},
					...rfc9457OpenAPISpecResponses(definitions),
				},
			}),
			async () => {
				throw new Error("Not implemented");
			},
		);

		// Act
		const specs = await generateSpecs(app);

		// Assert
		expect(specs).toEqual({
			components: {},
			info: {
				description: "Development documentation",
				title: "Hono Documentation",
				version: "0.0.0",
			},
			openapi: "3.1.0",
			paths: {
				"/endpoint": {
					get: {
						operationId: "getEndpoint",
						responses: {
							"200": {
								content: {
									"application/json": {
										schema: {
											description: "The object",
											properties: {
												message: {
													description: "The message",
													type: "string",
												},
											},
											required: ["message"],
											type: "object",
										},
									},
								},
								description: "The response",
							},
							"400": {
								content: {
									"application/problem+json": {
										schema: {
											properties: {
												barErrorAttribute: {
													anyOf: [
														{
															properties: {
																whatIsBar: {
																	type: "number",
																},
															},
															required: ["whatIsBar"],
															type: "object",
														},
														{
															type: "null",
														},
													],
												},
												detail: {
													description: "Detail of the error",
													type: "string",
												},
												fooErrorAttribute: {
													anyOf: [
														{
															properties: {
																whatIsFoo: {
																	type: "string",
																},
															},
															required: ["whatIsFoo"],
															type: "object",
														},
														{
															type: "null",
														},
													],
												},
												title: {
													anyOf: [
														{
															const: "invalidValue",
														},
														{
															const: "fooError",
														},
														{
															const: "barError",
														},
													],
													description: `Type of the error. Any of following values:

- \`invalidValue\`: Invalid value
- \`fooError\`: Foo error
- \`barError\`: Bar error`,
												},
											},
											required: [
												"title",
												"detail",
												"fooErrorAttribute",
												"barErrorAttribute",
											],
											type: "object",
										},
									},
								},
								description: "Error schema",
							},
							"401": {
								content: {
									"application/problem+json": {
										schema: {
											properties: {
												detail: {
													description: "Detail of the error",
													type: "string",
												},
												title: {
													anyOf: [
														{
															const: "unauthorized",
														},
													],
													description: `Type of the error. Any of following values:

- \`unauthorized\`: Unauthorized`,
												},
											},
											required: ["title", "detail"],
											type: "object",
										},
									},
								},
								description: "Error schema",
							},
							"403": {
								content: {
									"application/problem+json": {
										schema: {
											properties: {
												detail: {
													description: "Detail of the error",
													type: "string",
												},
												title: {
													anyOf: [
														{
															const: "permissionDenied",
														},
													],
													description: `Type of the error. Any of following values:

- \`permissionDenied\`: Permission denied`,
												},
											},
											required: ["title", "detail"],
											type: "object",
										},
									},
								},
								description: "Error schema",
							},
						},
						summary: "The endpoint",
					},
				},
			},
			tags: undefined,
		});
	});
});
