import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["./src/index.ts"],
	format: ["esm"],
	sourcemap: true,
	target: "esnext",
	tsconfig: "tsconfig.build.json",
});
