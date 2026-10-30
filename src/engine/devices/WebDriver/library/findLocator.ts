import type { Locator, Page } from 'playwright-core';
import { countedOf, ordinalOf, withoutRole } from '@/engine/devices/library';
import { CONTROL_SELECTOR } from '@/engine/devices/WebDriver/constants';
import { listControls } from './listControls';

type AriaRole = Parameters<Page['getByRole']>[0];

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
 * Acha o que o agente nomeou do jeito que uma pessoa acharia: um campo para digitar ou um
 * controle para clicar, pelo nome, mesmo quando um contador no fim dele mudou.
 */
export async function findLocator(props: {
  page: Page;
  target: string;
  kind: 'click' | 'fill';
}): Promise<Locator | null> {
  const found = await locate(props);
  const listed = withoutRole(props.target);
  const named =
    found ?? (listed === null ? null : await locate({ ...props, target: listed }));
  const counted = countedOf(ordinalOf(listed ?? props.target).name);

  return named ?? (counted === null ? null : onlyOne({ page: props.page, counted }));
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

  const fields = [
    page.getByLabel(name, { exact: true }),
    page.getByPlaceholder(name, { exact: true }),
    page.getByRole('textbox', { name, exact: true }),
    page.getByLabel(name),
    page.getByPlaceholder(name),
    page.getByRole('textbox', { name }),
    page.getByRole('combobox', { name }),
  ];
  const controls = [
    page.getByRole('button', { name, exact: true }),
    page.getByRole('link', { name, exact: true }),
    page.getByRole('button', { name }),
    page.getByRole('link', { name }),
    page.getByRole('checkbox', { name }),
    page.getByRole('radio', { name }),
    page.getByRole('tab', { name }),
    page.getByRole('menuitem', { name }),
    page.getByRole('option', { name }),
  ];
  const texts = [page.getByText(name, { exact: true }), page.getByText(name)];
  const candidates =
    kind === 'fill'
      ? [...fields, ...controls, ...texts, page.locator(name)]
      : [...controls, ...fields, ...texts, page.locator(name)];

  for (const candidate of candidates) {
    const shown = candidate.filter({ visible: true });
    const count = await shown.count().catch(() => 0);

    if (count > nth) return shown.nth(nth);
  }

  return null;
}
