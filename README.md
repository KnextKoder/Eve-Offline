# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

An offline first desktop app that builds ontop of vercel's eve agent framework to create, manage and update locally run agents.

Set up an Eve agent for the user. Eve is a filesystem-first TypeScript framework for durable agents, published as the npm package eve. Read its docs: once eve is installed they are bundled in the package at node_modules/eve/docs; before eve is installed, read the published Introduction and Getting Started pages. If the project has no Eve app, scaffold one with `npx eve@latest init <name>`; add `--channel-web-nextjs` only when the user wants Web Chat. The init command installs dependencies, initializes Git, and starts the dev server, so run it in a controllable process and stop it before editing. To add Eve to an existing app, run `npm install eve@latest`. Make sure agent/agent.ts and agent/instructions.md exist, then add a first typed tool at agent/tools/get_weather.ts using defineTool from eve/tools with a Zod inputSchema and an inline execute. Start the dev server again, then exercise the HTTP API: create a session with POST /eve/v1/session, attach to GET /eve/v1/session/:id/stream, and send a follow-up with the returned continuationToken. Verify with the project's typecheck, adapt model and provider choices to the project, and do not commit unless the user asks.