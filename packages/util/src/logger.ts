export interface Logger {
	get logsTrace(): boolean;
	trace(message: string): void;
	trace(payload: Record<string, unknown>, message: string): void;

	get logsDebug(): boolean;
	debug(message: string): void;
	debug(payload: Record<string, unknown>, message: string): void;

	get logsInfo(): boolean;
	info(message: string): void;
	info(payload: Record<string, unknown>, message: string): void;

	get logsWarn(): boolean;
	warn(message: string): void;
	warn(payload: Record<string, unknown>, message: string): void;

	get logsError(): boolean;
	error(message: string): void;
	error(payload: Record<string, unknown>, message: string): void;

	child(
		params?: Readonly<{
			payload?: Record<string, unknown>;
			messagePrefix?: string;
		}>,
	): Logger;
}

const logLevels = [
	"trace",
	"debug",
	"info",
	"warn",
	"error",
	"silent",
] as const;
export type LogLevel = (typeof logLevels)[number];

export type SimpleLoggingAdapterConstructorParams = Readonly<{
	level: LogLevel;
	logCallback: (
		level: LogLevel,
		message: string,
		payload?: Record<string, unknown> | undefined,
	) => void;
	messagePrefix?: string | undefined;
	payload?: Record<string, unknown> | undefined;
}>;
export class SimpleLoggingAdapter implements Logger {
	readonly #level: SimpleLoggingAdapterConstructorParams["level"];
	readonly #logCallback: SimpleLoggingAdapterConstructorParams["logCallback"];
	readonly #messagePrefix: SimpleLoggingAdapterConstructorParams["messagePrefix"];
	readonly #payload: SimpleLoggingAdapterConstructorParams["payload"];

	constructor(params: SimpleLoggingAdapterConstructorParams) {
		this.#level = params.level;
		this.#logCallback = params.logCallback;
		this.#messagePrefix = params.messagePrefix;
		this.#payload = params.payload;
	}

	get logsTrace(): boolean {
		return this.#logsLevel("trace");
	}

	get logsDebug(): boolean {
		return this.#logsLevel("debug");
	}

	get logsInfo(): boolean {
		return this.#logsLevel("info");
	}

	get logsWarn(): boolean {
		return this.#logsLevel("warn");
	}

	get logsError(): boolean {
		return this.#logsLevel("error");
	}

	trace(
		...params:
			| [message: string]
			| [payload: Record<string, unknown>, message: string]
	): void {
		this.#log("trace", ...params);
	}

	debug(
		...params:
			| [message: string]
			| [payload: Record<string, unknown>, message: string]
	): void {
		this.#log("debug", ...params);
	}

	info(
		...params:
			| [message: string]
			| [payload: Record<string, unknown>, message: string]
	): void {
		this.#log("info", ...params);
	}

	warn(
		...params:
			| [message: string]
			| [payload: Record<string, unknown>, message: string]
	): void {
		this.#log("warn", ...params);
	}

	error(
		...params:
			| [message: string]
			| [payload: Record<string, unknown>, message: string]
	): void {
		this.#log("error", ...params);
	}

	child(
		params?: Readonly<{
			payload?: Record<string, unknown>;
			messagePrefix?: string;
		}>,
	): Logger {
		return new SimpleLoggingAdapter({
			level: this.#level,
			logCallback: this.#logCallback,
			messagePrefix: this.#messagePrefix
				? params?.messagePrefix
					? `${this.#messagePrefix} ${params?.messagePrefix}`
					: this.#messagePrefix
				: params?.messagePrefix,
			payload: this.#payload
				? params?.payload
					? { ...this.#payload, ...params?.payload }
					: this.#payload
				: params?.payload,
		});
	}

	#log(
		level: LogLevel,
		...params:
			| [message: string]
			| [payload: Record<string, unknown>, message: string]
	) {
		if (!this.#logsLevel(level)) {
			return;
		}

		if (params.length === 1) {
			this.#logCallback(
				level,
				this.#messagePrefix ? `${this.#messagePrefix} ${params[0]}` : params[0],
			);
		} else {
			this.#logCallback(
				level,
				this.#messagePrefix ? `${this.#messagePrefix} ${params[1]}` : params[1],
				this.#payload ? { ...this.#payload, ...params[0] } : params[0],
			);
		}
	}

	#logsLevel(level: LogLevel): boolean {
		return logLevels.indexOf(this.#level) <= logLevels.indexOf(level);
	}
}
