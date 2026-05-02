"use client";

// لوحة الفلاتر — مرحلة، تخصص، مسار، تاريخ
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  STAGE_LABEL,
  TRACK_LABEL,
  SPECIALTY_LABEL,
  type WorkStage,
  type WorkTrack,
  type WorkSpecialty,
} from "@/types/works";

export interface FiltersState {
  stage: WorkStage | "ALL";
  track: WorkTrack | "ALL";
  specialty: WorkSpecialty | "ALL";
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_FILTERS: FiltersState = {
  stage: "ALL",
  track: "ALL",
  specialty: "ALL",
  dateFrom: "",
  dateTo: "",
};

export function activeFilterCount(f: FiltersState): number {
  let n = 0;
  if (f.stage !== "ALL") n++;
  if (f.track !== "ALL") n++;
  if (f.specialty !== "ALL") n++;
  if (f.dateFrom) n++;
  if (f.dateTo) n++;
  return n;
}

interface Props {
  value: FiltersState;
  onChange: (f: FiltersState) => void;
}

export function WorksFilters({ value, onChange }: Props) {
  const count = activeFilterCount(value);
  const update = (patch: Partial<FiltersState>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="rounded-2xl border border-saei-purple-100 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-saei-purple-700 font-bold">
          <Filter className="h-4 w-4" />
          <span>الفلاتر</span>
          {count > 0 && (
            <span className="text-xs bg-saei-gold text-white px-2 py-0.5 rounded-full tabular-nums">
              {count}
            </span>
          )}
        </div>
        {count > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            <X className="h-4 w-4" />
            مسح الكل
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-1.5">
          <Label htmlFor="f-stage">المرحلة</Label>
          <Select
            value={value.stage}
            onValueChange={(v) => update({ stage: v as FiltersState["stage"] })}
          >
            <SelectTrigger id="f-stage">
              <SelectValue placeholder="كل المراحل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل المراحل</SelectItem>
              {Object.entries(STAGE_LABEL).map(([k, l]) => (
                <SelectItem key={k} value={k}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="f-specialty">التخصص</Label>
          <Select
            value={value.specialty}
            onValueChange={(v) =>
              update({ specialty: v as FiltersState["specialty"] })
            }
          >
            <SelectTrigger id="f-specialty">
              <SelectValue placeholder="كل التخصصات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل التخصصات</SelectItem>
              {Object.entries(SPECIALTY_LABEL).map(([k, l]) => (
                <SelectItem key={k} value={k}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="f-track">المسار</Label>
          <Select
            value={value.track}
            onValueChange={(v) => update({ track: v as FiltersState["track"] })}
          >
            <SelectTrigger id="f-track">
              <SelectValue placeholder="كل المسارات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل المسارات</SelectItem>
              {Object.entries(TRACK_LABEL).map(([k, l]) => (
                <SelectItem key={k} value={k}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="f-from">من تاريخ</Label>
          <Input
            id="f-from"
            type="date"
            value={value.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className="ltr text-left"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="f-to">إلى تاريخ</Label>
          <Input
            id="f-to"
            type="date"
            value={value.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className="ltr text-left"
          />
        </div>
      </div>
    </div>
  );
}
