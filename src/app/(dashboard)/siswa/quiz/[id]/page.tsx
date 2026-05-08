// TODO: Quiz session per id
// - MCQ, isian singkat, handwritten canvas
// - Submit per soal (incremental) untuk anti-cheat
// - Feedback langsung setelah submit
export default function QuizSessionPage({
  params,
}: {
  params: { id: string };
}) {
  return <div>Quiz: {params.id}</div>;
}
