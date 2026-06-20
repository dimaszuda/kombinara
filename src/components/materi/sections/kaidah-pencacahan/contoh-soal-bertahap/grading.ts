export type GradeResult = {
  results: Record<string, "correct" | "incorrect">;
  allCorrect: boolean;
};

export function gradeBlanks(
  expected: Record<string, string>,
  values: Record<string, string>
): GradeResult {
  const results: Record<string, "correct" | "incorrect"> = {};
  let allCorrect = true;

  for (const id of Object.keys(expected)) {
    const isCorrect =
      (values[id] ?? "").trim().toLowerCase() === expected[id].trim().toLowerCase();
    results[id] = isCorrect ? "correct" : "incorrect";
    if (!isCorrect) allCorrect = false;
  }

  return { results, allCorrect };
}