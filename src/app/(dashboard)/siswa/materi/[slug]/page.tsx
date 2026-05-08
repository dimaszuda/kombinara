// TODO: Reader materi per slug
// - TipTap read-only renderer
// - Intersection Observer untuk reading engagement tracking
// - Floating toolbar untuk block text Q&A
// - Sticky progress indicator per section
export default function MateriDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <div>Materi: {params.slug}</div>;
}
