import type { IFrameRoot } from '@/engine/devices/WebDriver/types';
import type { Locator, Page } from 'playwright-core';
import { countedOf, ordinalOf, placedOf, withoutRole } from '@/engine/devices/library';
import { CONTROL_SELECTOR } from '@/engine/devices/WebDriver/constants';
import { frameRootsOf } from './frameRootsOf';
import { listControls } from './listControls';

type AriaRole = Parameters<Page['getByRole']>[0];

const TEST_ID = /^\[?\s*test-?id\s*[=:]\s*["']?([^"'\]]+)["']?\s*\]?$/i;

const TEST_ID_ATTRIBUTES = ['data-test-id', 'data-test', 'data-cy', 'data-qa'];

const BARE_TEST_ID = /^[\w.:-]+$/;

const REACH_CHECKS = 10;

const CLICKABLE: AriaRole[] = [
  'button',
  'link',
  'tab',
  'menuitem',
  'option',
  'checkbox',
  'radio',
  'switch',
];

const ROLE_OF_TAG: Partial<Record<string, AriaRole>> = {
  a: 'link',
  button: 'button',
  select: 'combobox',
  textarea: 'textbox',
  link: 'link',
  tab: 'tab',
  menuitem: 'menuitem',
  option: 'option',
  checkbox: 'checkbox',
  radio: 'radio',
  switch: 'switch',
  combobox: 'combobox',
};

/**
 * Acha o que o agente nomeou, na página e depois em cada iframe, só onde uma pessoa
 * acertaria: o nome no lugar dele, o nome exato, o que o contém, um test id.
 */
export async function findLocator(props: {
  page: Page;
  target: string;
  kind: 'click' | 'fill';
}): Promise<Locator | null> {
  for (const frame of await frameRootsOf(props.page)) {
    const found = await findIn({ frame, target: props.target, kind: props.kind });

    if (found !== null) return found;
  }

  return null;
}

async function findIn(props: {
  frame: IFrameRoot;
  target: string;
  kind: 'click' | 'fill';
}): Promise<Locator | null> {
  const { frame } = props;
  const testId = TEST_ID.exec(props.target.trim())?.[1]?.trim() ?? null;

  if (testId !== null) return byTestId({ frame, testId });

  const placed = await inPlace({ frame, target: props.target });

  if (placed !== null) return placed;

  const found = await locate(props);
  const listed = withoutRole(props.target);
  const named =
    found ?? (listed === null ? null : await locate({ ...props, target: listed }));
  const counted = countedOf(ordinalOf(listed ?? props.target).name);
  const worded = named ?? (counted === null ? null : await onlyOne({ frame, counted }));
  const bare = props.target.trim();

  return worded ?? (BARE_TEST_ID.test(bare) ? byTestId({ frame, testId: bare }) : null);
}

async function inPlace(props: {
  frame: IFrameRoot;
  target: string;
}): Promise<Locator | null> {
  const { name, nth } = ordinalOf(props.target.trim());
  const placed = placedOf(name);

  if (placed === null) return null;

  const { root, scope } = props.frame;
  const wanted = placed.name.toLowerCase();
  const where = placed.place.toLowerCase();
  const control = (await listControls(scope)).filter(
    ({ label, place }) =>
      label.toLowerCase() === wanted && place?.toLowerCase() === where,
  )[nth];

  if (control === undefined) return null;

  const role = ROLE_OF_TAG[control.role];

  if (role !== undefined && control.place !== null && control.placeTag !== null) {
    const semantic = root
      .locator(control.placeTag)
      .filter({ hasText: control.place })
      .getByRole(role, { name: control.label, exact: true });

    if ((await semantic.count().catch(() => 0)) === 1) return semantic;
  }

  return root.locator(CONTROL_SELECTOR).nth(control.at);
}

async function byTestId(props: {
  frame: IFrameRoot;
  testId: string;
}): Promise<Locator | null> {
  const { root } = props.frame;
  const quoted = props.testId.replace(/["\\]/g, '\\$&');

  for (const candidate of [
    root.getByTestId(props.testId),
    ...TEST_ID_ATTRIBUTES.map((name) => root.locator(`[${name}="${quoted}"]`)),
  ]) {
    const shown = candidate.filter({ visible: true });

    if ((await shown.count().catch(() => 0)) > 0) return shown.first();
  }

  return null;
}

async function onlyOne(props: {
  frame: IFrameRoot;
  counted: RegExp;
}): Promise<Locator | null> {
  const { counted } = props;
  const { root } = props.frame;

  for (const candidate of [
    root.getByRole('link', { name: counted }),
    root.getByRole('button', { name: counted }),
    root.getByText(counted),
  ]) {
    const shown = candidate.filter({ visible: true });

    if ((await shown.count().catch(() => 0)) === 1) return shown;
  }

  return null;
}

async function listed(props: {
  frame: IFrameRoot;
  name: string;
  nth: number;
}): Promise<Locator | null> {
  const { root, scope } = props.frame;
  const wanted = props.name.toLowerCase();
  const named = (await listControls(scope)).filter(
    ({ label }) => label.toLowerCase() === wanted,
  );
  const control = named[props.nth];

  if (control === undefined) return null;

  const role = ROLE_OF_TAG[control.role];
  const sameRole = named.filter((one) => one.role === control.role);
  const semantic =
    role === undefined
      ? null
      : root.getByRole(role, { name: control.label, exact: true });
  const count = semantic === null ? 0 : await semantic.count().catch(() => 0);

  return semantic !== null && count === sameRole.length
    ? semantic.nth(sameRole.indexOf(control))
    : root.locator(CONTROL_SELECTOR).nth(control.at);
}

async function locate(props: {
  frame: IFrameRoot;
  target: string;
  kind: 'click' | 'fill';
}): Promise<Locator | null> {
  const { frame, kind } = props;
  const page = frame.root;
  const { name, nth, isNumbered } = ordinalOf(props.target.trim());

  if (name.length === 0) return null;

  const numbered = isNumbered ? await listed({ frame, name, nth }) : null;

  if (numbered !== null) return numbered;

  const exactFields = [
    page.getByLabel(name, { exact: true }),
    page.getByPlaceholder(name, { exact: true }),
    page.getByRole('textbox', { name, exact: true }),
  ];
  const looseFields = [
    page.getByLabel(name),
    page.getByPlaceholder(name),
    page.getByRole('textbox', { name }),
    page.getByRole('combobox', { name }),
  ];
  const exactControls = CLICKABLE.map((role) =>
    page.getByRole(role, { name, exact: true }),
  );
  const looseControls = CLICKABLE.map((role) => page.getByRole(role, { name }));
  const exactText = page.getByText(name, { exact: true });
  const looseText = page.getByText(name);
  const candidates =
    kind === 'fill'
      ? [
          ...exactFields,
          ...looseFields,
          ...exactControls,
          exactText,
          ...looseControls,
          looseText,
          page.locator(name),
        ]
      : [
          ...exactControls,
          exactText,
          ...looseControls,
          ...exactFields,
          ...looseFields,
          looseText,
          page.locator(name),
        ];

  let unreached: Locator | null = null;

  for (const candidate of candidates) {
    const shown = candidate.filter({ visible: true });
    const count = await shown.count().catch(() => 0);

    if (count <= nth) continue;

    const reached = await reachedOf({ shown, count });
    const wanted = reached[nth];

    if (wanted !== undefined) return wanted;

    unreached ??= shown.nth(nth);
  }

  return unreached;
}

async function reachedOf(props: { shown: Locator; count: number }): Promise<Locator[]> {
  const reached: Locator[] = [];

  for (let at = 0; at < Math.min(props.count, REACH_CHECKS); at += 1) {
    const one = props.shown.nth(at);

    if (await isReached(one)) reached.push(one);
  }

  return reached;
}

async function isReached(locator: Locator): Promise<boolean> {
  return locator
    .evaluate((node) => {
      type Element = {
        parentElement: Element | null;
        contains: (other: unknown) => boolean;
        getRootNode: () => { host?: Element };
        getBoundingClientRect: () => {
          left: number;
          top: number;
          width: number;
          height: number;
        };
        ownerDocument: {
          defaultView: {
            innerWidth: number;
            innerHeight: number;
            getComputedStyle: (one: Element) => { opacity: string; visibility: string };
          } | null;
          elementFromPoint: (x: number, y: number) => Element | null;
        };
      };
      const own = node as unknown as Element;
      const view = own.ownerDocument.defaultView;
      const up = (one: Element): Element | null =>
        one.parentElement ?? one.getRootNode().host ?? null;

      if (view === null) return true;

      for (let one: Element | null = own; one !== null; one = up(one)) {
        const style = view.getComputedStyle(one);

        if (Number(style.opacity) === 0 || style.visibility === 'hidden') return false;
      }

      const box = own.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;

      if (x < 0 || y < 0 || x > view.innerWidth || y > view.innerHeight) return true;

      const hit = own.ownerDocument.elementFromPoint(x, y);

      if (hit === null) return false;

      if (own.contains(hit)) return true;

      for (let one: Element | null = own; one !== null; one = up(one))
        if (one === hit) return true;

      return false;
    })
    .catch(() => true);
}
