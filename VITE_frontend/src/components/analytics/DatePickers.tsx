import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

// Helper functions
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day); // Start of week (Sunday)
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

// Daily Date Picker
interface DailyPickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function DailyPicker({ value, onChange }: DailyPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value + "T00:00:00");
    if (!isNaN(date.getTime())) {
      onChange(date);
    }
  };

  const goToPrevDay = () => {
    const prev = new Date(value);
    prev.setDate(prev.getDate() - 1);
    onChange(prev);
  };

  const goToNextDay = () => {
    const next = new Date(value);
    next.setDate(next.getDate() + 1);
    if (next <= today) {
      onChange(next);
    }
  };

  const isToday = value.toDateString() === today.toDateString();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goToPrevDay} className="h-9 w-9">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[180px] justify-start gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {formatDate(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <Input
            type="date"
            value={value.toISOString().split("T")[0]}
            onChange={handleChange}
            max={today.toISOString().split("T")[0]}
            className="w-full"
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextDay}
        disabled={isToday}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Weekly Picker
interface WeeklyPickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function WeeklyPicker({ value, onChange }: WeeklyPickerProps) {
  const today = new Date();
  const { start, end } = getWeekRange(value);
  const currentWeek = getWeekRange(today);

  const goToPrevWeek = () => {
    const prev = new Date(value);
    prev.setDate(prev.getDate() - 7);
    onChange(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(value);
    next.setDate(next.getDate() + 7);
    const nextWeek = getWeekRange(next);
    if (nextWeek.start <= today) {
      onChange(next);
    }
  };

  const isCurrentWeek = start.toDateString() === currentWeek.start.toDateString();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goToPrevWeek} className="h-9 w-9">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 px-4 py-2 rounded-md border bg-background min-w-[220px]">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {formatDate(start)} - {formatDate(end)}
        </span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextWeek}
        disabled={isCurrentWeek}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Monthly Picker
interface MonthlyPickerProps {
  month: number; // 0-11
  year: number;
  onChange: (month: number, year: number) => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MonthlyPicker({ month, year, onChange }: MonthlyPickerProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const goToPrevMonth = () => {
    if (month === 0) {
      onChange(11, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const goToNextMonth = () => {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    if (nextYear < currentYear || (nextYear === currentYear && nextMonth <= currentMonth)) {
      onChange(nextMonth, nextYear);
    }
  };

  const isCurrentMonth = month === currentMonth && year === currentYear;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goToPrevMonth} className="h-9 w-9">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex gap-2">
        <Select value={month.toString()} onValueChange={(v) => onChange(parseInt(v), year)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, i) => {
              const disabled = year === currentYear && i > currentMonth;
              return (
                <SelectItem key={i} value={i.toString()} disabled={disabled}>
                  {m}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={year.toString()} onValueChange={(v) => onChange(month, parseInt(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Yearly Picker
interface YearlyPickerProps {
  year: number;
  onChange: (year: number) => void;
}

export function YearlyPicker({ year, onChange }: YearlyPickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const goToPrevYear = () => onChange(year - 1);
  const goToNextYear = () => {
    if (year < currentYear) {
      onChange(year + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goToPrevYear} className="h-9 w-9">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select value={year.toString()} onValueChange={(v) => onChange(parseInt(v))}>
        <SelectTrigger className="w-[120px]">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextYear}
        disabled={year >= currentYear}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
