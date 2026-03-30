import { UnreachableCase } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import { Hono } from "hono";
import { html } from "hono/html";
import { validator } from "hono/validator";
import type { Port } from "@/port";
import { setAuthCookieForUser } from "@/util/auth";

export const loginApp = (
	injected: Port<"authenticateUserWithEmailAndPassword" | "jwtSecret">,
) =>
	new Hono()
		.get("/", async (c) => {
			return c.html(loginForm({ email: "", path: c.req.path }));
		})
		.post(
			"/",
			validator("form", (form, c) => {
				const email = form["email"];
				const password = form["password"];
				if (!email || typeof email !== "string") {
					return c.html(
						loginForm({
							email: "",
							error: "email is required",
							path: c.req.path,
						}),
						400,
					);
				}
				if (!password || typeof password !== "string") {
					return c.html(
						loginForm({
							email: email,
							error: "password is required",
							path: c.req.path,
						}),
						400,
					);
				}

				return {
					email,
					password,
				};
			}),
			async (c) => {
				const { email, password } = c.req.valid("form");
				const authResult = await injected.authenticateUserWithEmailAndPassword({
					email: email,
					password,
				});
				if (!authResult.success) {
					switch (authResult.error.kind) {
						case "userWithEmailNotFound":
						case "passwordMismatch": {
							return c.html(
								loginForm({
									email: email,
									error: "email or password mismatch",
									path: c.req.path,
								}),
								400,
							);
						}
						default: {
							throw new UnreachableCase(authResult.error);
						}
					}
				}

				await setAuthCookieForUser(c, {
					jwtSecret: injected.jwtSecret,
					userSlug: authResult.value.user.slug,
				});
				return c.redirect("/");
			},
		);

const loginForm = (
	params: Readonly<{
		email: string;
		error?: string;
		path: string;
	}>,
) => html`
${params.error ? html`<p>Error: ${params.error}</p>` : ""}
<form action="${params.path}" method="post">
    <div class="form-group">
        <label for="email">email</label>
        <input type="email" name="email" value="${params.email}" />
    </div>
    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" name="password" />
    </div>
    <button type="submit">Login</button>
</form>`;
