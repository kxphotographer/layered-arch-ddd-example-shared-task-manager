# Example project for explaining layered architecture and domain-driven design

This is an example project for explaining layered architecture and domain-driven design.

## Package structure

This project is a monorepo managed by pnpm.

- `packages/presentation`: Presentation layer, a.k.a. user interface layer.
- `packages/domain`: Domain layer.
- `packages/use-case`: Use cases, a.k.a. application layer.
- `packages/infrastructure`: Infrastructure layer, a.k.a. persistence layer.
- `apps/node-server`: Node.js server application.