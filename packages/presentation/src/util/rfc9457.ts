import type {
	ClientErrorStatusCode,
	ServerErrorStatusCode,
} from "hono/utils/http-status";
import { resolver } from "hono-openapi";
import * as v from "valibot";

export type RFC9457ResponseErrorDefinition = Readonly<{
	status: ClientErrorStatusCode | ServerErrorStatusCode;
	title: string;
	description: string;
	specificSchema?: v.GenericSchema;
}>;

export type InferRFC9457ResponseBodyPerStatus<
	D extends RFC9457ResponseErrorDefinition,
> = {
	[S in D["status"]]: {
		title: Extract<D, { status: S }>["title"];
		detail: string;
	} & {
		[Title in Extract<D, { status: S }>["title"] as Extract<
			D,
			{ status: S; title: Title }
		> extends { specificSchema: v.GenericSchema }
			? `${Title}Attribute`
			: never]:
			| (Extract<D, { status: S; title: Title }> extends {
					specificSchema: infer SpecificSchema extends v.GenericSchema;
			  }
					? v.InferOutput<SpecificSchema>
					: never)
			| null;
	};
};

export type RFC9457ResponseBodySchemaPerStatus<
	D extends RFC9457ResponseErrorDefinition,
> = {
	[S in D["status"]]: v.GenericSchema<InferRFC9457ResponseBodyPerStatus<D>[S]>;
};
export const rfc9457ResponseBodySchemaPerStatus = <
	const D extends RFC9457ResponseErrorDefinition,
>(
	definitions: Iterable<D>,
): RFC9457ResponseBodySchemaPerStatus<D> =>
	// @ts-expect-error - Hard to fix this type error
	Object.fromEntries(
		[...definitions]
			.reduce((acc, definition) => {
				const existingDefinitionsForStatus = acc.get(definition.status);
				if (existingDefinitionsForStatus) {
					existingDefinitionsForStatus.push(definition);
				} else {
					acc.set(definition.status, [definition]);
				}
				return acc;
			}, new Map<D["status"], D[]>())
			.entries()
			.map(([status, definitions]) => [
				status,
				v.object({
					title: v.pipe(
						v.union(definitions.map((d) => v.literal(d.title))),
						v.description(
							`Type of the error. Any of following values:\n\n${definitions
								.map((d) => `- \`${d.title}\`: ${d.description}`)
								.join("\n")}`,
						),
					),
					detail: v.pipe(v.string(), v.description("Detail of the error")),
					...definitions.reduce(
						(acc, d) => {
							if (!d.specificSchema) {
								return acc;
							}
							acc[`${d.title}Attribute`] = v.nullable(d.specificSchema);
							return acc;
						},
						{} as Record<string, v.GenericSchema>,
					),
				}),
			]),
	);

type RFC9457OpenAPISpecResponses<D extends RFC9457ResponseErrorDefinition> = {
	[S in D["status"]]: {
		description: string;
		content: {
			"application/problem+json": {
				schema: ReturnType<
					typeof resolver<
						v.GenericSchema<InferRFC9457ResponseBodyPerStatus<D>[S]>
					>
				>;
			};
		};
	};
};
export const rfc9457OpenAPISpecResponses = <
	const D extends RFC9457ResponseErrorDefinition,
>(
	definitions: readonly D[],
): RFC9457OpenAPISpecResponses<D> => {
	// @ts-expect-error - Hard to fix this type error
	return Object.fromEntries(
		Array.from(
			definitions
				.reduce((acc, definition) => {
					const existingDefinitionsForStatus = acc.get(definition.status);
					if (existingDefinitionsForStatus) {
						existingDefinitionsForStatus.push(definition);
					} else {
						acc.set(definition.status, [definition]);
					}
					return acc;
				}, new Map<D["status"], D[]>())
				.entries(),
		).map(([status, definitions]) => {
			return [
				status,
				{
					description: "Error schema",
					content: {
						"application/problem+json": {
							schema: resolver<
								v.GenericSchema<
									InferRFC9457ResponseBodyPerStatus<D>[typeof status]
								>
							>(rfc9457ResponseBodySchemaPerStatus(definitions)[status]),
						},
					},
				},
			];
		}),
	);
};
