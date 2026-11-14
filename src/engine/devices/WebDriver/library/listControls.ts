import type { Frame, Page } from 'playwright-core';
import { CONTROL_SELECTOR } from '@/engine/devices/WebDriver/constants';

/**
 * Os controles que uma pessoa vê, na ordem da página: o papel, as palavras, o test id, o
 * lugar de um que repete as palavras de outro, e a posição entre todos os controles.
 */
export async function listControls(page: Page | Frame): Promise<
  {
    role: string;
    label: string;
    testId: string | null;
    place: string | null;
    placeTag: string | null;
    at: number;
  }[]
> {
  try {
    return await page.$$eval(
      CONTROL_SELECTOR,
      (nodes, selector) => {
        type Copy = {
          querySelectorAll: (selector: string) => {
            forEach: (each: (one: { remove: () => void }) => void) => void;
          };
          textContent: string | null;
        };
        type Slot = {
          assignedNodes?: (options: { flatten: boolean }) => ArrayLike<{
            textContent: string | null;
          }>;
        };
        type Box = {
          parentElement: Box | null;
          tagName: string;
          innerText: string;
          querySelectorAll: (selector: string) => ArrayLike<unknown>;
          querySelector: (selector: string) => { innerText: string } | null;
        };
        type Control = Box & {
          getClientRects: () => { length: number };
          getAttribute: (name: string) => string | null;
          querySelectorAll: (selector: string) => ArrayLike<unknown> & ArrayLike<Slot>;
          labels?: {
            [index: number]: { cloneNode: (deep: boolean) => Copy };
            length: number;
          } | null;
        };

        const squeeze = (text: string | null | undefined) =>
          (text ?? '').replace(/\s+/g, ' ').trim();
        const labelOf = (element: Control, role: string) => {
          const first =
            element.labels && element.labels.length > 0 ? element.labels[0] : undefined;
          const own = first?.cloneNode(true);

          own?.querySelectorAll('input, select, textarea, button').forEach((one) => {
            one.remove();
          });

          const slotted = Array.from(element.querySelectorAll('slot') as ArrayLike<Slot>)
            .flatMap((slot) => Array.from(slot.assignedNodes?.({ flatten: true }) ?? []))
            .map((one) => one.textContent ?? '')
            .join(' ');

          return (
            [
              element.getAttribute('aria-label'),
              own?.textContent,
              element.getAttribute('placeholder'),
              element.getAttribute('name'),
              role === 'select' ? '' : element.innerText,
              slotted,
            ]
              .map(squeeze)
              .find((text) => text.length > 0) ?? ''
          );
        };
        const controls = (nodes as unknown as Control[]).map((element) => {
          const role = element.getAttribute('role') ?? element.tagName.toLowerCase();

          return { element, role, label: labelOf(element, role) };
        });
        const labelByElement = new Map<unknown, string>(
          controls.map(({ element, label }) => [element, label.toLowerCase()]),
        );
        const totals = new Map<string, number>();

        for (const { label } of controls)
          if (label.length > 0)
            totals.set(label.toLowerCase(), (totals.get(label.toLowerCase()) ?? 0) + 1);

        const placeOf = (element: Control, label: string) => {
          const wanted = label.toLowerCase();
          const sameIn = (box: Box) =>
            Array.from(box.querySelectorAll(selector)).filter(
              (one) => labelByElement.get(one) === wanted,
            ).length;
          let inner: Box = element;

          while (inner.parentElement !== null && sameIn(inner.parentElement) === 1)
            inner = inner.parentElement;

          if (inner === element) return null;

          const heading = squeeze(
            inner.querySelector('h1, h2, h3, h4, h5, h6, [role=heading]')?.innerText,
          );
          const line = inner.innerText
            .split('\n')
            .map(squeeze)
            .find((one) => one.length > 0 && one.toLowerCase() !== wanted);
          const words = heading.length > 0 ? heading : (line ?? '');

          return words.length === 0
            ? null
            : { place: words.slice(0, 40), placeTag: inner.tagName.toLowerCase() };
        };

        return controls.flatMap(({ element, role, label }, at) => {
          if (element.getClientRects().length === 0) return [];

          const testId =
            ['data-testid', 'data-test-id', 'data-test', 'data-cy', 'data-qa']
              .map((name) => element.getAttribute(name))
              .find((value) => value !== null && value.trim().length > 0) ?? null;
          const placed =
            label.length > 0 && (totals.get(label.toLowerCase()) ?? 0) > 1
              ? placeOf(element, label)
              : null;

          return label.length === 0 && testId === null
            ? []
            : [
                {
                  role,
                  label: label.slice(0, 60),
                  testId,
                  place: placed?.place ?? null,
                  placeTag: placed?.placeTag ?? null,
                  at,
                },
              ];
        });
      },
      CONTROL_SELECTOR,
    );
  } catch {
    return [];
  }
}
