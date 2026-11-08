/**
 * O que um trabalho respondeu, ou um erro com as palavras dadas quando ele passa do
 * limite; o trabalho em si não é cancelado.
 */
export async function withinLimit<T>(props: {
  work: Promise<T>;
  ms: number;
  said: string;
}): Promise<T> {
  const { work, ms, said } = props;
  let timer: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      work,
      new Promise<never>((_, refuse) => {
        timer = setTimeout(() => {
          refuse(new Error(said));
        }, ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
