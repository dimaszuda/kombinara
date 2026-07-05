"use client";

import { useState } from "react";

const VEHICLE_GROUPS = [
  {
    key: "sepeda",
    label: "3 Sepeda",
    vehicles: [
      { id: "sepeda-1", label: "Sepeda 1", placeholderSrc: "PLACEHOLDER_SRC_SEPEDA_1" },
      { id: "sepeda-2", label: "Sepeda 2", placeholderSrc: "PLACEHOLDER_SRC_SEPEDA_2" },
      { id: "sepeda-3", label: "Sepeda 3", placeholderSrc: "PLACEHOLDER_SRC_SEPEDA_3" },
    ],
  },
  {
    key: "motor",
    label: "2 Motor",
    vehicles: [
      { id: "motor-1", label: "Motor 1", placeholderSrc: "PLACEHOLDER_SRC_MOTOR_1" },
      { id: "motor-2", label: "Motor 2", placeholderSrc: "PLACEHOLDER_SRC_MOTOR_2" },
    ],
  },
  {
    key: "mobil",
    label: "1 Mobil",
    vehicles: [
      { id: "mobil-1", label: "Mobil", placeholderSrc: "PLACEHOLDER_SRC_MOBIL_1" },
    ],
  },
];

export default function VehicleChoicePicker() {
  const [selectedId, setSelectedId] = useState(null);
  const hasSelected = selectedId !== null;

  return (
    <div className="rounded-xl border border-[#34673933] bg-white p-4">
      <p className="mb-3 text-sm font-medium text-[#2C2C2A] items-center">👇 Pilih kendaraan yang dipakai</p>
      {/* Kendaraan dikelompokkan visual per kategori */}
      <div className="flex flex-wrap justify-center gap-5">
        {VEHICLE_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="mb-2 text-xs font-medium text-[#663362]">{group.label}</p>
            <div className="flex gap-2">
              {group.vehicles.map((vehicle) => {
                const isSelected = selectedId === vehicle.id;
                const isDimmed = hasSelected && !isSelected;
                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    disabled={isDimmed}
                    onClick={() => setSelectedId(isSelected ? null : vehicle.id)}
                    className={[
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all duration-200",
                      isSelected
                        ? "border-[#346739] bg-[#DBFFD5] scale-105 shadow-sm"
                        : isDimmed
                          ? "border-[#34673933] opacity-40 cursor-default"
                          : "border-[#34673933] hover:border-[#346739] hover:bg-[#DBFFD540] cursor-pointer",
                    ].join(" ")}
                  >
                    {/* TODO: ganti src dengan path gambar kendaraan, misal /images/vehicles/sepeda-1.png */}
                    <img
                      src={vehicle.placeholderSrc}
                      alt={vehicle.label}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-md bg-gray-200 object-contain"
                    />
                    <span className="text-[11px] font-medium text-[#2C2C2A]">{vehicle.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Teks jembatan — muncul setelah siswa memilih pertama kali */}
      {hasSelected && (
        <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
          Kamu baru saja memilih 1 dari{" "}
          <span className="font-medium text-[#346739]">6 kemungkinan</span> yang ada. Nah, gimana
          kalau dihitung semuanya?
        </p>
      )}

      {/* Tombol reset — muncul setelah siswa memilih */}
      {hasSelected && (
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="mt-3 rounded-full border border-[#346739] px-4 py-1.5 text-sm font-medium text-[#346739] transition-colors hover:bg-[#DBFFD5] active:scale-95"
        >
          Coba pilih lagi
        </button>
      )}
    </div>
  );
}
