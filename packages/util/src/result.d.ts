export type Result<T, E = never> =
	| {
			success: true;
			value: T;
	  }
	| (E extends never
			? never
			: {
					success: false;
					error: E;
				});
export type ExtractSuccessResult<T extends Result<unknown, unknown>> = Extract<
	T,
	{
		success: true;
	}
>;
export type ExtractFailureResult<T extends Result<unknown, unknown>> = Extract<
	T,
	{
		success: false;
	}
>;
//# sourceMappingURL=result.d.ts.map
