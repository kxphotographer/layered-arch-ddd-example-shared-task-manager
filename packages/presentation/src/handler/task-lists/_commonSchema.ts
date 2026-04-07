import * as v from "valibot";

const taskListSlugPathParamName = "taskListSlug";

export const taskListSlugPathParamPart = `:${taskListSlugPathParamName}`;
export const taskListSlugPathParamSchema = {
	[taskListSlugPathParamName]: v.pipe(
		v.string(),
		v.minLength(1),
		v.description("Unique identifier of the task list"),
	),
};
