import type { ClassCodeInfo } from "@/hooks/useClassCodeLookup";

/** Kartu ringkas kelas tujuan setelah kode kelas valid. */
export default function ClassInfoCard({ info, title = "Kamu akan bergabung ke" }: { info: ClassCodeInfo; title?: string }) {
  return (
    <div className="rounded-2xl border border-brand-600 bg-brand-50 px-5 py-3">
      <p className="text-xs text-[#6B6B66]">{title}</p>
      <p className="text-base font-bold text-brand-600">Kelas {info.label}</p>
      <p className="text-sm text-[#2C2C2A]">
        {info.schoolName} · Tahun ajaran {info.academicYear}
      </p>
    </div>
  );
}
