import { describe, expect, test } from "vitest";
import { type LogLevel, SimpleLoggingAdapter } from "./logger";

describe("ConsoleLogger", () => {
	test.each<
		Readonly<{
			arrangement: {
				logLevel: LogLevel;
			};
			action: {
				method: `logs${Capitalize<Exclude<LogLevel, "silent">>}`;
			};
			assertion: {
				expectedResult: boolean;
			};
		}>
	>([
		{
			arrangement: { logLevel: "trace" },
			action: { method: "logsTrace" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "trace" },
			action: { method: "logsDebug" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "trace" },
			action: { method: "logsInfo" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "trace" },
			action: { method: "logsWarn" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "trace" },
			action: { method: "logsError" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "debug" },
			action: { method: "logsTrace" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "debug" },
			action: { method: "logsDebug" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "debug" },
			action: { method: "logsInfo" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "debug" },
			action: { method: "logsWarn" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "debug" },
			action: { method: "logsError" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "info" },
			action: { method: "logsTrace" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "info" },
			action: { method: "logsDebug" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "info" },
			action: { method: "logsInfo" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "info" },
			action: { method: "logsWarn" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "info" },
			action: { method: "logsError" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "warn" },
			action: { method: "logsTrace" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "warn" },
			action: { method: "logsDebug" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "warn" },
			action: { method: "logsInfo" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "warn" },
			action: { method: "logsWarn" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "warn" },
			action: { method: "logsError" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "error" },
			action: { method: "logsTrace" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "error" },
			action: { method: "logsDebug" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "error" },
			action: { method: "logsInfo" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "error" },
			action: { method: "logsWarn" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "error" },
			action: { method: "logsError" },
			assertion: { expectedResult: true },
		},
		{
			arrangement: { logLevel: "silent" },
			action: { method: "logsTrace" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "silent" },
			action: { method: "logsDebug" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "silent" },
			action: { method: "logsInfo" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "silent" },
			action: { method: "logsWarn" },
			assertion: { expectedResult: false },
		},
		{
			arrangement: { logLevel: "silent" },
			action: { method: "logsError" },
			assertion: { expectedResult: false },
		},
	])("$action.method should be $assertion.expectedResult when logLevel is $arrangement.logLevel", ({
		arrangement,
		action,
		assertion,
	}) => {
		const logger = new SimpleLoggingAdapter({
			level: arrangement.logLevel,
			logCallback: () => {},
		});
		expect(logger[action.method]).toEqual(assertion.expectedResult);
	});
});
