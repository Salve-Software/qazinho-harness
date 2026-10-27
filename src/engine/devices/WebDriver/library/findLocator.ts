import type { Locator, Page } from 'playwright-core';
import { ordinalOf, withoutRole } from '@/engine/devices/library';
import { CONTROL_SELECTOR } from '@/engine/devices/WebDriver/constants';
import { listControls } from './listControls';

/**
 * Finds what the agent named the way a person would: a field to type in or a control to
 * click, by name.
 */
export async function findLocator(props: {
  page: Page;
  target: string;
  kind: 'click' | 'fill';
}): Promise<Locator | null> {
  const found = await locate(props);
  const listed = withoutRole(props.target);

  return found ?? (listed === null ? null : locate({ ...props, target: listed }));
}

async function listed(props: {
  page: Page;
  name: string;
  nth: number;
}): Promise<Locator | null> {
  const wanted = props.name.toLowerCase();
  const control = (await listControls(props.page)).filter(
    ({ label }) => label.toLowerCase() === wanted,
  )[props.nth];

  return control === undefined
    ? null
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
