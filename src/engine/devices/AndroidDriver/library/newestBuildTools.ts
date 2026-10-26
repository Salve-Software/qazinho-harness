function asNumbers(name: string): number[] {
  return name.split('.').map((part) => Number(part) || 0);
}

/** An SDK carries several build-tools; the newest is the one that knows the newest apk. */
export function newestBuildTools(names: string[]): string | null {
  const versions = names.filter((name) => /^\d+(\.\d+)*$/.test(name));

  return (
    versions.sort((first, second) => {
      const [a, b] = [asNumbers(first), asNumbers(second)];

      return (
        (b[0] ?? 0) - (a[0] ?? 0) ||
        (b[1] ?? 0) - (a[1] ?? 0) ||
        (b[2] ?? 0) - (a[2] ?? 0)
      );
    })[0] ?? null
  );
}
