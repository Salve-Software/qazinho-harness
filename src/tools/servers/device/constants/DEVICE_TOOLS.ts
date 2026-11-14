import { z } from 'zod';
import { DRAFTED_CASE } from '@/schemas/DRAFTED_CASE';
import { bugIdNamed } from '@/tools/library/bugIdNamed';
import { textNamed } from '@/tools/library/textNamed';
import { variableNamed } from '@/tools/library/variableNamed';
import { BUG_CATEGORY_INPUT } from './BUG_CATEGORY_INPUT';
import { BUG_TARGET_INPUT } from './BUG_TARGET_INPUT';
import { SEVERITY_SCALE } from './SEVERITY_SCALE';

export const DEVICE_TOOLS = [
  {
    name: 'look',
    description:
      'Read what the device shows right now: the visible text and the controls a person could use.',
    input: z.object({}),
  },
  {
    name: 'inspect',
    description:
      'Measure one thing on the screen, to hold it to a design: where it sits and how big it is, its distance to what is around it, and in a browser its type, colours, spacing, border and corners. Name it the way look lists it or the screen reads it.',
    input: z.object({
      target: textNamed({
        message: '"inspect" needs a target: say what the thing on screen reads.',
        description: 'What the thing says, or how look lists it.',
      }),
    }),
  },
  {
    name: 'network',
    description:
      'Read the API calls the app made in the browser: the latest ones, with how each ended and how long it took. Give "id" to read what one answered, such as a 200 whose data looks wrong on screen. Secrets read as dots.',
    input: z.object({
      id: z
        .number({ error: '"id" is the number a call is listed with, such as 12.' })
        .int({ error: '"id" is the number a call is listed with, such as 12.' })
        .positive({ error: '"id" is the number a call is listed with, such as 12.' })
        .describe('The number of a call as listed, to read what it answered.')
        .optional(),
      filter: z
        .string()
        .trim()
        .describe('Words its address holds, such as "coupon", to list only those calls.')
        .optional(),
    }),
  },
  {
    name: 'goto',
    description:
      'Open a URL in the browser, or reopen the app from the launcher on a phone.',
    input: z.object({
      target: textNamed({
        message: '"goto" needs a target: say what the control or URL is.',
        description: 'The URL to open.',
      }),
    }),
  },
  {
    name: 'reopen',
    description:
      'Close the app completely and open it again, with what it saved kept, as a person does who swipes it away and taps its icon; in a browser, the page closes and its address opens in a new tab.',
    input: z.object({}),
  },
  {
    name: 'click',
    description:
      'Click or tap a control, named the way a person reads it: the button label, the link text, the row text. When several read alike, look tells them apart by their place, like "Buy · Blue shirt", or by a number, like "Buy #2": name the one you mean the way look lists it.',
    input: z.object({
      target: textNamed({
        message: '"click" needs a target: say what the control or URL is.',
        description: 'What the control says.',
      }),
      dialog: z
        .enum(['ok', 'cancel'], { error: '"dialog" is ok or cancel.' })
        .describe(
          'How to answer a browser dialog the click opens, such as "Are you sure?": ok unless the step says to cancel it.',
        )
        .optional(),
      promptText: z
        .string()
        .describe(
          'What to type into a browser prompt the click opens, such as a new title, before it is answered ok.',
        )
        .optional(),
    }),
  },
  {
    name: 'fill',
    description:
      'Type into a field, named by its label, placeholder or hint. When several read alike, look tells them apart by their place, like "Email · Billing", or by a number, like "Email #2": name the one you mean the way look lists it.',
    input: z.object({
      target: textNamed({
        message: '"fill" needs a target: say what the control or URL is.',
        description: 'The field label, placeholder or hint.',
      }),
      value: z
        .string({ error: '"fill" needs a value: say what to type.' })
        .describe(
          'What to type. A variable of the project goes as ${NAME}, and QAzinho types its value.',
        ),
    }),
  },
  {
    name: 'press',
    description:
      'Press a key: Enter, Tab, Escape on a browser; back, home, enter, tab, delete, escape or search on a phone.',
    input: z.object({
      target: textNamed({
        message: '"press" needs a target: say what the control or URL is.',
        description: 'The key.',
      }),
      dialog: z
        .enum(['ok', 'cancel'], { error: '"dialog" is ok or cancel.' })
        .describe(
          'How to answer a browser dialog the key opens, such as "Are you sure?": ok unless the step says to cancel it.',
        )
        .optional(),
      promptText: z
        .string()
        .describe(
          'What to type into a browser prompt the key opens, such as a new title, before it is answered ok.',
        )
        .optional(),
    }),
  },
  {
    name: 'scroll',
    description:
      'Scroll the screen, or the list under it, to bring into view what is not on screen yet. Give the words to stop at when you know them. Scroll before you decide something is missing.',
    input: z.object({
      direction: z
        .enum(['down', 'up', 'left', 'right'], {
          error: '"scroll" needs "direction": down, up, left or right.',
        })
        .describe('Where to look: down shows what is below, right what is to the right.'),
      until: z
        .string()
        .trim()
        .describe('Words to scroll until they show, as the screen will read them.')
        .optional(),
    }),
  },
  {
    name: 'long_press',
    description:
      'Hold a finger, or the mouse, on a control: a long press, for the menu, selection or edit it opens.',
    input: z.object({
      target: textNamed({
        message: '"long_press" needs a target: say what the control is.',
        description: 'What the control says.',
      }),
    }),
  },
  {
    name: 'drag',
    description:
      'Drag a control and drop it on another: a card onto a column, a row to a new place in its list.',
    input: z.object({
      target: textNamed({
        message: '"drag" needs a target: say what to drag.',
        description: 'What to drag, as the screen reads it.',
      }),
      to: textNamed({
        message: '"drag" needs "to": say where to drop it.',
        description: 'What to drop it on, as the screen reads it.',
      }),
    }),
  },
  {
    name: 'hover',
    description:
      'Rest the mouse on a control, to show what appears on hover: a tooltip, a menu, a preview. In a browser only.',
    input: z.object({
      target: textNamed({
        message: '"hover" needs a target: say what the control is.',
        description: 'What the control says.',
      }),
    }),
  },
  {
    name: 'upload',
    description:
      'Pick files in a file field, or in the button that opens the file picker. In a browser only. When a step names the QA\'s own files, or the case lists files of this plan, give them in "paths": several at once when the step sends them together. Only those files can be picked. Give "file" for a sample only when the step does not say which file.',
    input: z
      .object({
        target: textNamed({
          message: '"upload" needs a target: say what the file field or button is.',
          description: 'The file field or the button that opens the picker.',
        }),
        paths: z
          .array(
            z
              .string({ error: '"paths" is a list of full file paths.' })
              .trim()
              .min(1, { error: '"paths" holds full file paths, none of them blank.' }),
            { error: '"paths" is a list of full file paths.' },
          )
          .min(1, { error: '"paths" needs at least one file.' })
          .max(10, { error: '"paths" holds ten files at most.' })
          .describe("Each of the QA's files to pick, as the step or the list writes it.")
          .optional(),
        file: z
          .enum(['image', 'pdf', 'csv', 'text'], {
            error: '"file" is image, pdf, csv or text.',
          })
          .describe('The kind of sample file to pick, when the step names no file.')
          .optional(),
      })
      .refine(({ paths, file }) => paths !== undefined || file !== undefined, {
        error:
          '"upload" needs "paths" with the QA\'s files, or "file" with a sample kind.',
      }),
  },
  {
    name: 'open_download',
    description:
      'Open a file the browser downloaded on a new screen of the device, to read it: a PDF, an image or a text file such as a CSV. In a browser only. Every answer lists DOWNLOADS once the browser saved a file. Use it whenever a step checks what a downloaded file says or looks like: never settle for a preview in the app, and never ask the QA to open it. The answer reads the part in view: scroll shows the rest, and tab with "close" goes back to the app.',
    input: z.object({
      target: z
        .string()
        .trim()
        .describe('The file as DOWNLOADS lists it. Leave it out for the latest one.')
        .optional(),
    }),
  },
  {
    name: 'tab',
    description:
      'Work on more than one screen at once, as two people at two computers would: only when a step needs it, such as two users editing the same thing. In a browser only. "new" opens another tab with the same login, "new_session" opens a clean browser that shares nothing with this one, to sign in with another account, "switch" moves you to the screen numbered in "value", and "close" closes the screen numbered in "value", or this one. Every answer lists the screens open and the one you are on.',
    input: z.object({
      target: z
        .enum(['new', 'new_session', 'switch', 'close'], {
          error: '"tab" needs "target": new, new_session, switch or close.',
        })
        .describe('What to do.'),
      value: z
        .string()
        .trim()
        .describe(
          'For new and new_session: the URL to open, left out for the app. For switch and close: the number of the screen.',
        )
        .optional(),
    }),
  },
  {
    name: 'wait',
    description: 'Wait for the device to settle, in milliseconds, before looking again.',
    input: z.object({
      value: textNamed({
        message: '"wait" needs a value: how many milliseconds.',
        description: 'Milliseconds, e.g. "1000".',
      }),
    }),
  },
  {
    name: 'report',
    description:
      'Report a step once you judged it, by its number. Words the plan quotes are what the QA expects to read: when the screen words that control or text differently, fail the step with the screen\'s words in "got", and give "goesOn" so the case goes on with the control the screen shows. When you did not find the screen or control the step names, call ask_qa first, saying where you looked: the QA may know the way, and report only after their answer. The answer says what to do next.',
    input: z.object({
      step: z
        .number({ error: '"report" needs "step": the number of the step you judged.' })
        .int({ error: '"report" needs "step": the number of the step you judged.' })
        .min(1, { error: '"report" needs "step": the number of the step you judged.' })
        .describe('The number of the step you judged.'),
      verdict: z.enum(['passed', 'failed', 'blocked'], {
        error: '"report" needs "verdict": passed, failed or blocked.',
      }),
      why: textNamed({
        message: '"report" needs "why": what the verdict rests on.',
        description:
          'What the verdict rests on: what you saw, held against what the QA expected. One short sentence when the step passed.',
      }),
      got: z
        .string({ error: '"report" needs "got": what the device actually showed.' })
        .trim()
        .describe('What the device actually showed: a few words when the step passed.'),
      title: z
        .string()
        .trim()
        .describe('When it failed: the line a developer would know the bug by.')
        .optional(),
      severity: z
        .enum(['high', 'medium', 'low'], {
          error: '"severity" is high, medium or low.',
        })
        .describe(`When it failed: ${SEVERITY_SCALE}`)
        .optional(),
      goesOn: z
        .boolean()
        .describe(
          'When it failed: true when the action itself went through and the next step can start from this screen, and only what the step expects is wrong, such as a total, a price or a text. The bug is filed and the case goes on, so the steps after it are still tested. Leave it out when the next steps cannot start from here.',
        )
        .optional(),
      note: z
        .string()
        .trim()
        .describe('When you worked around something: one sentence for the QA.')
        .optional(),
      proof: z
        .string()
        .trim()
        .describe(
          'When the step passed: a few words that prove it, copied exactly from the screen text look gave you, not from the picture, which would not be there had it failed, such as "Visits: 1"; a variable reads there as its ${NAME}. One line for each thing the step expects, such as a count and a total. QAzinho walks the step again without you and checks every line against that text.',
        )
        .optional(),
      sameAs: bugIdNamed(
        'When it failed for a bug the case lists as already open: its id, such as "BUG-01". QAzinho counts it as seen again instead of opening another.',
      ),
      frame: z
        .string()
        .describe(
          'When it failed because the screen differs from the Figma design in what the step expects: the node id of the frame it differs from, such as 12:345. Call get_screenshot on that frame first, once: QAzinho shows that picture beside the bug as the prototype. Do not file that difference again with bug.',
        )
        .optional(),
      category: BUG_CATEGORY_INPUT,
      target: BUG_TARGET_INPUT,
    }),
  },
  {
    name: 'bug',
    description:
      'File a bug you saw, such as a wrong price, a broken link or two texts that disagree, and carry on. File it while the screen still shows it: QAzinho keeps the screen as it is when you call bug, and a reload or another screen first keeps one that may no longer show the bug. The screen is the evidence, so what is wrong must be on it: name it in target and QAzinho scrolls to it first; with no target, scroll to it yourself before calling bug. In a case, file only what the step does not ask about: the step keeps its own verdict.',
    input: z.object({
      title: textNamed({
        message: '"bug" needs "title": the line a developer would know the bug by.',
        description: 'The line a developer would know the bug by.',
      }),
      severity: z
        .enum(['high', 'medium', 'low'], {
          error: '"severity" is high, medium or low.',
        })
        .describe(SEVERITY_SCALE),
      expected: textNamed({
        message: '"bug" needs "expected": what the app should show.',
        description: 'What the app should show.',
      }),
      got: textNamed({
        message: '"bug" needs "got": what the device actually showed.',
        description: 'What the device actually showed.',
      }),
      sameAs: bugIdNamed(
        'When it is a bug the message lists as already open: its id, such as "BUG-01". QAzinho counts it as seen again instead of opening another.',
      ),
      frame: z
        .string()
        .describe(
          'When the bug is a difference from the Figma design: the node id of the frame the screen differs from, such as 12:345. Call get_screenshot on that frame first, once: QAzinho shows that picture beside the bug as the prototype.',
        )
        .optional(),
      category: BUG_CATEGORY_INPUT,
      target: BUG_TARGET_INPUT,
    }),
  },
  {
    name: 'say',
    description:
      'Tell the QA, in one short sentence in their language, what you are doing and why. They are watching the screen and only see clicks: say it before any work the step does not name, such as preparing data the case needs, looking for a screen you did not find, or working around something. Give the reason, not the action. Call it together with your next action, never on its own.',
    input: z.object({
      text: textNamed({
        message: '"say" needs "text": what you are doing and why.',
        description:
          'What you are doing and why, such as "This case needs a template with a product table: the account has none, so I am creating one".',
      }),
      memory: z
        .string()
        .trim()
        .describe(
          'When this line is about something QAzinho has learned about the app: its id as the message lists it, such as "m-3f2a1b".',
        )
        .optional(),
    }),
  },
  {
    name: 'answer_qa',
    description:
      'Answer what the QA told you in the middle of the run: what you checked and what you found, in a sentence or two in their language. The plan goes on after it.',
    input: z.object({
      text: textNamed({
        message: '"answer_qa" needs "text": what you checked and what you found.',
        description: 'What you checked and what you found.',
      }),
    }),
  },
  {
    name: 'ask_qa',
    description:
      'Ask the QA a question and wait for the answer, when you cannot go on without them: data nothing you were given holds, such as a code sent to their phone, a choice only they can make, or something on screen only they can judge, that the step leaves open. The run holds until they answer. The QA only watches the device you drive: they cannot click, type or attach anything on it, so never ask them to do something there and never offer an option such as "I did it myself". What has to happen on screen is yours to do; when you cannot do it, report the step blocked. They answer in words only: for a file, ask for its full path, never for them to attach it. Never ask whether a screen that differs from what the step expects is right: report the step failed.',
    input: z.object({
      question: textNamed({
        message: '"ask_qa" needs "question": what you need from the QA.',
        description:
          'What you need from the QA, short enough to answer at a glance: what you see, and what you need to go on.',
      }),
      options: z
        .array(
          z
            .string({ error: '"options" is a list of short answers.' })
            .trim()
            .min(1, { error: '"options" holds short answers, none of them blank.' }),
          { error: '"options" is a list of short answers.' },
        )
        .max(4, { error: '"options" holds four answers at most.' })
        .describe(
          'When the answer is one of a few: up to four short answers the QA picks from. They can always answer in their own words.',
        )
        .optional(),
      screen: z
        .string()
        .trim()
        .max(60)
        .describe(
          'The screen you are on, in the words the app uses for it, such as "Carrinho": the QA sees the question under it.',
        )
        .optional(),
      secret: z
        .object(
          {
            name: variableNamed(
              '"secret" needs "name": the variable to keep it as, in capitals with _ between words, such as OTP_CODE.',
            ).describe(
              'The variable, in capitals with _ between words, such as OTP_CODE.',
            ),
            description: textNamed({
              message: '"secret" needs "description": what it holds.',
              description: 'What it holds, such as "The code texted to the QA\'s phone".',
            }),
          },
          {
            error:
              '"secret" is the variable to keep the answer as: a name and what it holds.',
          },
        )
        .describe(
          'Only when the answer is a secret, such as a password or a code sent to the QA: the variable QAzinho keeps it as. You type it as ${NAME} and never see it. One answer is one value: for an account, ask for the login first, then for the password as a secret.',
        )
        .optional(),
    }),
  },
  {
    name: 'screen',
    description:
      'Note a screen of the app the first time you reach it: what a person would call it and what it is for. QAzinho keeps its picture as a stop on the map of the app.',
    input: z.object({
      name: textNamed({
        message: '"screen" needs "name": what a person would call this screen.',
        description: 'What a person would call the screen, such as "Cart" or "Sign in".',
      }),
      about: textNamed({
        message: '"screen" needs "about": what the screen is for.',
        description:
          'What the screen is for and what a person can do on it, in a sentence.',
      }),
    }),
  },
  {
    name: 'finish',
    description:
      'End the exploration: what you explored and how it went, and the test cases a plan should hold from what you saw, the most important first.',
    input: z.object({
      summary: textNamed({
        message: '"finish" needs "summary": what you explored and how it went.',
        description:
          'What you explored, what held up and what broke, in a few sentences.',
      }),
      cases: z
        .array(DRAFTED_CASE.omit({ id: true }), {
          error: '"finish" needs "cases": the test cases you suggest, as a list.',
        })
        .describe('The test cases you suggest, the most important first.'),
    }),
  },
] as const;
