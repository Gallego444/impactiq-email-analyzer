"use client";

import { useMemo } from "react";
import { format, isWithinInterval, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatDisplayRange,
  MAX_RANGE_DAYS,
  validateDateRange,
} from "@/lib/date-range";

export interface DateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onFromChange: (date: Date | undefined) => void;
  onToChange: (date: Date | undefined) => void;
  className?: string;
}

function DateField({
  label,
  value,
  onChange,
  rangeFrom,
  rangeTo,
  isStart,
}: {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  rangeFrom: Date | undefined;
  rangeTo: Date | undefined;
  isStart: boolean;
}) {
  const modifiers = useMemo(() => {
    if (!rangeFrom || !rangeTo) return undefined;
    return {
      range_start: (date: Date) => isSameDay(date, rangeFrom),
      range_end: (date: Date) => isSameDay(date, rangeTo),
      range_middle: (date: Date) =>
        isWithinInterval(date, { start: rangeFrom, end: rangeTo }) &&
        !isSameDay(date, rangeFrom) &&
        !isSameDay(date, rangeTo),
    };
  }, [rangeFrom, rangeTo]);

  return (
    <div className="flex flex-1 flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 w-full justify-start border-white/10 bg-white/5 text-left font-normal text-slate-200 hover:bg-white/10",
              !value && "text-slate-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-blue-400" />
            {value
              ? format(value, "d MMM yyyy", { locale: es })
              : "Seleccionar fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border-white/10 bg-gray-900 p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            locale={es}
            disabled={(date) => date > new Date()}
            modifiers={modifiers}
            modifiersClassNames={{
              range_start: "bg-primary text-primary-foreground",
              range_end: "bg-primary text-primary-foreground",
              range_middle: "bg-primary/20",
            }}
            defaultMonth={value ?? (isStart ? rangeTo : rangeFrom) ?? new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: DateRangePickerProps) {
  const { valid, days, error } = validateDateRange(from, to);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <DateField
          label="Fecha inicio"
          value={from}
          onChange={onFromChange}
          rangeFrom={from}
          rangeTo={to}
          isStart
        />
        <DateField
          label="Fecha fin"
          value={to}
          onChange={onToChange}
          rangeFrom={from}
          rangeTo={to}
          isStart={false}
        />
      </div>

      {from && to && (
        <p className="text-center text-sm text-slate-400">
          {formatDisplayRange(from, to)}
        </p>
      )}

      {error && (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {valid && (
        <p className="text-center text-sm font-medium text-emerald-400">
          {days} {days === 1 ? "día" : "días"} seleccionados (máx.{" "}
          {MAX_RANGE_DAYS})
        </p>
      )}
    </div>
  );
}

export function isDateRangeValid(
  from: Date | undefined,
  to: Date | undefined
): boolean {
  return validateDateRange(from, to).valid;
}
