import type { Page } from 'playwright-core';
import { CONTROL_SELECTOR } from '@/engine/devices/WebDriver/constants';

/**
 * Os controles que uma pessoa vê, na ordem da página: o papel, as palavras de cada um, o
 * test id que o time deu a ele, e o lugar dele entre todos os controles.
 */
export async function listControls(
  page: Page,
): Promise<{ role: string; label: string; testId: string | null; at: number }[]> {
  try {
    return await page.$$eval(CONTROL_SELECTOR, (nodes) =>
      nodes.flatMap((node, at) => {
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
        const element = node as unknown as {
          getClientRects: () => { length: number };
          getAttribute: (name: string) => string | null;
          querySelectorAll: (selector: 'slot') => ArrayLike<Slot>;
          innerText: string;
          tagName: string;
          labels?: {
            [index: number]: { cloneNode: (deep: boolean) => Copy };
            length: number;
          } | null;
        };

        if (element.getClientRects().length === 0) return [];

        const role = element.getAttribute('role') ?? element.tagName.toLowerCase();
        const first =
          element.labels && element.labels.length > 0 ? element.labels[0] : undefined;
        const own = first?.cloneNode(true);

        own?.querySelectorAll('input, select, textarea, button').forEach((one) => {
          one.remove();
        });

        const slotted = Array.from(element.querySelectorAll('slot'))
          .flatMap((slot) => Array.from(slot.assignedNodes?.({ flatten: true }) ?? []))
          .map((one) => one.textContent ?? '')
          .join(' ');

        const label =
          [
            element.getAttribute('aria-label'),
            own?.textContent,
            element.getAttribute('placeholder'),
            element.getAttribute('name'),
            role === 'select' ? '' : element.innerText,
            slotted,
          ]
            .map((text) => (text ?? '').replace(/\s+/g, ' ').trim())
            .find((text) => text.length > 0) ?? '';

        const testId =
          ['data-testid', 'data-test-id', 'data-test', 'data-cy', 'data-qa']
            .map((name) => element.getAttribute(name))
            .find((value) => value !== null && value.trim().length > 0) ?? null;

        return label.length === 0 && testId === null
          ? []
          : [{ role, label: label.slice(0, 60), testId, at }];
      }),
    );
  } catch {
    return [];
  }
}
