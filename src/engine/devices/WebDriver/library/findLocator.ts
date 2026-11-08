import type { Locator, Page } from 'playwright-core';
import { countedOf, ordinalOf, withoutRole } from '@/engine/devices/library';
import { CONTROL_SELECTOR } from '@/engine/devices/WebDriver/constants';
import { listControls } from './listControls';

type AriaRole = Parameters<Page['getByRole']>[0];

const TEST_ID = /^\[?\s*test-?id\s*[=:]\s*["']?([^"'\]]+)["']?\s*\]?$/i;

const TEST_ID_ATTRIBUTES = ['data-test-id', 'data-test', 'data-cy', 'data-qa'];

const BARE_TEST_ID = /^[\w.:-]+$/;

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
 * Acha o que o agente nomeou como uma pessoa: o nome exato, depois o que o contém, e por
 * fim um test id escrito sem o `testid=`.
 */
export async function findLocator(props: {
  page: Page;
  target: string;
  kind: 'click' | 'fill';
}): Promise<Locator | null> {
  const testId = TEST_ID.exec(props.target.trim())?.[1]?.trim() ?? null;

  if (testId !== null) return byTestId({ page: props.page, testId });

  const found = await locate(props);
  const listed = withoutRole(props.target);
  const named =
    found ?? (listed === null ? null : await locate({ ...props, target: listed }));
  const counted = countedOf(ordinalOf(listed ?? props.target).name);

  const worded =
    named ?? (counted === null ? null : await onlyOne({ page: props.page, counted }));
  const bare = props.target.trim();

  return (
    worded ??
    (BARE_TEST_ID.test(bare) ? byTestId({ page: props.page, testId: bare }) : null)
  );
}

async function byTestId(props: { page: Page; testId: string }): Promise<Locator | null> {
  const quoted = props.testId.replace(/["\\]/g, '\\$&');

  for (const candidate of [
    props.page.getByTestId(props.testId),
    ...TEST_ID_ATTRIBUTES.map((name) => props.page.locator(`[${name}="${quoted}"]`)),
  ]) {
    const shown = candidate.filter({ visible: true });

    if ((await shown.count().catch(() => 0)) > 0) return shown.first();
  }

  return null;
}

async function onlyOne(props: { page: Page; counted: RegExp }): Promise<Locator | null> {
  const { page, counted } = props;

  for (const candidate of [
    page.getByRole('link', { name: counted }),
    page.getByRole('button', { name: counted }),
    page.getByText(counted),
  ]) {
    const shown = candidate.filter({ visible: true });

    if ((await shown.count().catch(() => 0)) === 1) return shown;
  }

  return null;
}

async function listed(props: {
  page: Page;
  name: string;
  nth: number;
}): Promise<Locator | null> {
  const wanted = props.name.toLowerCase();
  const named = (await listControls(props.page)).filter(
    ({ label }) => label.toLowerCase() === wanted,
  );
  const control = named[props.nth];

  if (control === undefined) return null;

  const role = ROLE_OF_TAG[control.role];
  const sameRole = named.filter((one) => one.role === control.role);
  const semantic =
    role === undefined
      ? null
      : props.page.getByRole(role, { name: control.label, exact: true });
  const count = semantic === null ? 0 : await semantic.count().catch(() => 0);

  return semantic !== null && count === sameRole.length
    ? semantic.nth(sameRole.indexOf(control))
    : props.page.locator(CONTROL_SELECTOR).nth(control.at);
}

async function locate(props: {
  page: Page;
  target: string;
  kind: 'click' | 'fill';
}): Promise<Locator | null> {
  const { page, kind } = props;
  const { name, nth, isNumbered } = ordinalOf(props.target.trim());

  if (name.length === 0) return null;

  const numbered = isNumbered ? await listed({ page, name, nth }) : null;

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

  for (const candidate of candidates) {
    const shown = candidate.filter({ visible: true });
    const count = await shown.count().catch(() => 0);

    if (count > nth) return shown.nth(nth);
  }

  return null;
}
