import React from "react";
import Link from "next/link";
import { IconClock, IconUserSolo, IconUserPair, IconUserGroup } from "@/components/activity/ActivityIcons";
import AktivitasSiswaAccessGate from "@/components/activity/AktivitasSiswaAccessGate";

// ── Types ──
type GroupingType = "individu" | "pasangan" | "kelompok";
type PilarKey = "mindful" | "joyful" | "meaningful";

interface AktivitasItem {
  nomor: number;
  grouping: string;
  groupingType: GroupingType;
  judul: string;
  titleNote: string | null;
  durasi: string;
  pilar: PilarKey[];
}

interface ActivityCardProps {
  data: AktivitasItem;
}

const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
};

const PILAR = {
  mindful: { label: "Mindful", color: "#2A5A8C" },
  joyful: { label: "Joyful", color: "#C9962B" },
  meaningful: { label: "Meaningful", color: "#4CAF50" },
};

const GROUP_ICON: Record<GroupingType, React.FC> = {
  individu: IconUserSolo,
  pasangan: IconUserPair,
  kelompok: IconUserGroup,
};

const aktivitas: AktivitasItem[] = [
  {
    nomor: 1,
    grouping: "INDIVIDU",
    groupingType: "individu",
    judul: "“Permutasi atau Kombinasi? Aku yang Menentukan!”",
    titleNote: null,
    durasi: "15 menit",
    pilar: ["mindful"],
  },
  {
    nomor: 2,
    grouping: "PASANGAN",
    groupingType: "pasangan",
    judul: "“Kasus Per Kasus vs Komplemen — Pilih Strategimu!”",
    titleNote: null,
    durasi: "25 menit",
    pilar: ["joyful", "mindful"],
  },
  {
    nomor: 3,
    grouping: "KELOMPOK KECIL (4 Orang)",
    groupingType: "kelompok",
    judul: "“Tim Konsultan Sekolah”",
    titleNote: null,
    durasi: "35 menit",
    pilar: ["joyful", "meaningful", "mindful"],
  },
];

function ActivityCard({ data }: ActivityCardProps) {
  const GroupIcon = GROUP_ICON[data.groupingType];

  return (
    <div
      className="min-w-0 bg-white rounded-2xl border-2 p-5 flex flex-col"
      style={{ borderColor: C.greenLight }}
    >
      {/* Header: number + label */}
      <div className="flex items-center gap-2 mb-2">
        <div
          style={{ backgroundColor: C.green }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        >
          {data.nomor}
        </div>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.green }}>
          Aktivitas {data.nomor}
        </span>
      </div>

      {/* Grouping badge */}
      <div className="mb-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: C.greenLight, color: C.green }}
        >
          <GroupIcon />
          {data.grouping}
        </span>
      </div>

      {/* Title */}
      <h3
        className={`text-lg font-bold ${data.titleNote ? "mb-1" : "mb-3"}`}
        style={{ color: C.purple }}
      >
        {data.judul}
      </h3>
      {data.titleNote && (
        <p className="text-sm font-medium mb-3" style={{ color: C.green }}>
          {data.titleNote}
        </p>
      )}

      {/* Duration + indicators */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: C.green, color: C.white }}
        >
          <IconClock />
          {data.durasi}
        </span>
      </div>

      {/* Pilar */}
      <div className="flex items-center gap-3 flex-wrap pt-3 border-t" style={{ borderColor: "#f1f5f9" }}>
        <span className="text-xs font-semibold text-slate-500">Pilar:</span>
        {data.pilar.map((key: PilarKey) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: PILAR[key].color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PILAR[key].color }}></span>
            {PILAR[key].label}
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Kerjakan button */}
      <Link
        href={`/siswa/activity/kombinasi/${data.nomor}`}
        className="mt-4 block text-center rounded-xl py-2.5 text-sm font-bold transition-opacity hover:opacity-80"
        style={{ backgroundColor: C.green, color: C.white }}
      >
        Kerjakan
      </Link>
    </div>
  );
}

export default function AktivitasSiswa() {
  return (
    <AktivitasSiswaAccessGate conceptId="kombinasi" materialSlug="kombinasi">
      <div className="min-h-screen py-8 px-4" style={{ backgroundColor: C.white }}>
        <div className="max-w-[1400px] mx-auto">
          {/* Page header */}
          <div className="mb-8 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-[0.12em] mb-2"
              style={{ color: C.green, opacity: 0.7 }}
            >
              Aktivitas Materi Kombinasi
            </p>
            <h1 className="text-2xl font-bold" style={{ color: C.purple }}>
              “Ketika Yang Penting Siapa, Bukan Urutan”
            </h1>
            <p className="text-sm mt-2 max-w-2xl mx-auto" style={{ color: "#5a7d5c" }}>
              Setelah menyelesaikan aktivitas ini, siswa mampu membedakan kombinasi dari permutasi berdasarkan konteks,
              menerapkan rumus kombinasi termasuk dengan syarat, memilih strategi penyelesaian yang tepat, dan
              menjelaskan alasan penggunaan kombinasi secara konseptual.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 pb-4">
            {aktivitas.map((a) => (
              <ActivityCard key={a.nomor} data={a} />
            ))}
          </div>
        </div>
      </div>
    </AktivitasSiswaAccessGate>
  );
}
