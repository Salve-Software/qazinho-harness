# Comments

**No comments in the code.** Not `//`, not `/* */`, not `{/* */}` in JSX, not in CSS. The code,
its names and its tests say what it does; a commit message says why it changed.

## JSDoc, and only here

JSDoc is the one exception, so hovering a name in the editor explains it. It goes **only** above:

| Where                                        | Example                                          |
| -------------------------------------------- | ------------------------------------------------ |
| A function in a `library/` file              | `export function isInternalNavigation(...)`      |
| A type in a `types/` file                    | `export interface IQazinhoApi`, `export type …`  |
| A class declaration, and each of its methods | `export class AgentRunner`, `public async ask()` |
| A component declaration                      | `export const Composer: React.FC<...>`           |

Nowhere else: not on a constant, a view model, a hook, a store, a service function, a variable, a
CSS rule, or inside an interface body.

```ts
/** Whether a navigation stays inside the app: same origin, or the packaged page itself. */
export function isInternalNavigation(appUrl: string, url: string): boolean {}
```

- **Never inside an interface or a type.** No JSDoc and no comment on a property, a method
  signature or a field of a type literal: what a member means goes in its name, or in the type's
  own JSDoc. `qazinho/no-comment-in-type` fails the lint on one.
- **Two lines at most, each within 90 columns.** One is better. Say what the thing does, directly,
  and stop: not everything it touches, not why it exists. `qazinho/short-jsdoc` fails the lint on
  a longer one.
- It says what **that** thing does. If it stays true pasted onto another thing of the same kind,
  it says nothing.
- A good name needs no JSDoc: leave it out rather than repeat the name.

## Tests are the exception

In `__tests__/` and `tests/`, comments and JSDoc are free: a test may explain the trap it guards,
the fake it builds, or why a case exists.

## What used to be a comment

A trap that would have been a comment (Electron swallowing a click in a drag region, a CDP frame
that needs an ack) becomes a test that fails when someone falls into it, a name that says it, or a
line in the commit message.
