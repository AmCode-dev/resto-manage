"use client"

import { buttonVariants } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerSingleProps } from "react-day-picker"
import { format, isValid } from "date-fns" // Import isValid
import { es } from "date-fns/locale"

// Define the Reservation type for better type safety
interface Reservation {
  id: number
  cliente: string
  hora: string
  personas: number
  mesa: string
  contacto: string
  estado: "Confirmada" | "Pendiente" | "Completada" | "Cancelada"
  date: Date
}

export interface CalendarProps extends DayPickerSingleProps {
  className?: string
  classNames?: DayPickerSingleProps["classNames"]
  showOutsideDays?: boolean
  reservations?: Reservation[] // New prop to pass reservations
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  reservations = [], // Default to empty array
  ...props
}: CalendarProps) {
  const CustomDay = React.useCallback(
    ({ day, displayMonth, ...dayProps }) => {
      // Ensure 'day' is a valid Date object before proceeding
      if (!isValid(day)) {
        // console.error("Invalid day object received by CustomDay:", day); // Uncomment for debugging if needed
        return null // Return null or a fallback if the day is invalid
      }

      const dayHasReservations = reservations.some((res) => {
        // Ensure res.date is a valid Date object before formatting
        if (!res || !res.date || !isValid(res.date)) {
          return false
        }
        return format(res.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      })

      return (
        <div className="relative">
          <DayPicker.Day day={day} displayMonth={displayMonth} {...dayProps} />
          {dayHasReservations && <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-blue-500" />}
        </div>
      )
    },
    [reservations],
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Day: CustomDay, // Use the custom Day component
      }}
      locale={es} // Set locale to Spanish
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
