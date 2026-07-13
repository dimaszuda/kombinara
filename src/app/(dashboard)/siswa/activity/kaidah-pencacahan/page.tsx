import React from "react";
import Link from "next/link";
import { IconClock, IconUserSolo, IconUserPair, IconUserGroup } from "@/components/activity/ActivityIcons";

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
  indikator: string[];
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
    judul: "“Aku Setektif Pilihan”",
    titleNote: "(Mindful)",
    durasi: "15 menit",
    indikator: ["IK-1.1", "IK-3.1"],
    pilar: ["mindful"],
  },
  {
    nomor: 2,
    grouping: "PASANGAN",
    groupingType: "pasangan",
    judul: "“Sortir Kasus”",
    titleNote: null,
    durasi: "20 menit",
    indikator: ["IK-1.1", "IK-3.1", "IK-4.2"],
    pilar: ["joyful", "mindful"],
  },
  {
    nomor: 3,
    grouping: "KELOMPOK KECIL (4 Orang)",
    groupingType: "kelompok",
    judul: "“Rancang Sistemmu Sendiri”",
    titleNote: null,
    durasi: "30 menit",
    indikator: ["IK-1.1", "IK-3.1", "IK-4.1", "IK-4.2", "IK-5.4"],
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
        {data.indikator.map((ind: string) => (
          <span
            key={ind}
            className="rounded-md px-2.5 py-1 text-xs font-semibold border"
            style={{ borderColor: C.green, color: C.green }}
          >
            {ind}
          </span>
        ))}
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
        href={`/siswa/activity/kaidah-pencacahan/${data.nomor}`}
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
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: C.white }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 pb-4">
          {aktivitas.map((a) => (
            <ActivityCard key={a.nomor} data={a} />
          ))}
        </div>
      </div>
    </div>
  );
}