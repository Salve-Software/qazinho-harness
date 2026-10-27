# Code structure

The same rules as the desktop app's, applied to a package with no classes/ tree.

## A class sits at the root of the folder it serves

`Harness.class.ts` at `src/`, `McpHost.class.ts` at `src/tools/`. Each shares its folder's
`library/`, `types/` and `constants/`. A class folder here would only repeat the name of the
folder around it.

## File names

| File     | Pattern                      | Example                                        |
| -------- | ---------------------------- | ---------------------------------------------- |
| Folder   | `lowercase`, a group         | `src/tools/servers/device/`                    |
| Class    | `<PascalCase>.class.ts`      | `McpHost.class.ts`                             |
| Library  | `camelCase.ts`, one function | `library/jsonSchemaOf.ts`                      |
| Constant | `SCREAMING_SNAKE.ts`, one    | `constants/TOOL_GRANTS.ts`                     |
| Type     | `<TypeName>.ts`, one type    | `types/IDevicePort.ts`                         |
| Corpus   | `kebab-case.md`, one section | `context/corpus/role/runner/walking-a-case.md` |
| Test     | `__tests__/<name>.test.ts`   | `library/__tests__/jsonSchemaOf.test.ts`       |

## One file holds one thing

A class file holds the class, a library file one exported function, a constant file one value, a
type file one type. A helper that stays private may live beside its single export. Enforced by
`no-restricted-syntax` over `**/*.class.ts`.

## A library file opens with its export

The exported function comes first, after the imports and any private type or value it reads. The
private helper functions it calls go after it, at the end of the file, so whoever opens the file
reads what it does before how. `no-restricted-syntax` over `library/` fails a helper declared
before the export.

## Types

- An `interface` carries the `I` prefix; a `type` does not.
- A `types/` barrel re-exports with `export type *`, never `export *`.
- A result with more than one shape is a discriminated union.

## At most 2 parameters

A function, method or constructor with more than 2 parameters takes an object (`max-params`).

## Order inside a class

fields → constructor → public methods → private methods (`member-ordering`).

## Every folder of things has an `index.ts`

A caller imports the folder, never one file inside it. Inside the package, `@/` points at `src/`;
`../` is a lint error. `import type` comes first, in its own declaration.
