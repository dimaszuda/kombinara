// TODO: Ulangan session
// - Timer countdown dengan auto-submit
// - Page Visibility API untuk anti-cheat (catat tab switching)
// - Incremental answer submission ke backend
// - Lock soal setelah waktu habis
export default function UlanganSessionPage({
  params,
}: {
  params: { id: string };
}) {
  return <div>Ulangan: {params.id}</div>;
}
