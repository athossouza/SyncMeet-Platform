"use client"
// FORCE_DEPLOY_REFRESH_V2

import * as React from "react"
import { format, addMinutes, setHours, setMinutes } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface SessionSchedulerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    endDate: Date | undefined
    setEndDate: (date: Date | undefined) => void
}

// Generate time slots every 15 minutes
const generateTimeSlots = () => {
    const times = []
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 15) {
            const hour = i.toString().padStart(2, '0')
            const minute = j.toString().padStart(2, '0')
            times.push(`${hour}:${minute}`)
        }
    }
    return times
}

const TIME_SLOTS = generateTimeSlots()

export function SessionScheduler({
    date,
    setDate,
    endDate,
    setEndDate,
}: SessionSchedulerProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    // Initial duration in minutes (default 60 if logic allows, otherwise 0)
    const getDuration = () => {
        if (date && endDate) {
            return (endDate.getTime() - date.getTime()) / 60000
        }
        return 0
    }

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            setDate(undefined)
            setEndDate(undefined)
            return
        }

        // Preserve time if updating date, or set to default 08:00
        let newDate = selectedDate
        if (date) {
            newDate = setHours(newDate, date.getHours())
            newDate = setMinutes(newDate, date.getMinutes())
        } else {
            newDate = setHours(newDate, 8)
            newDate = setMinutes(newDate, 0)
        }

        setDate(newDate)

        // Update End Date preserving duration or default to +1h
        if (endDate) {
            const duration = (endDate.getTime() - (date?.getTime() || 0))
            // If duration is valid (>0), apply it. Else default +1h
            if (duration > 0 && date) {
                setEndDate(new Date(newDate.getTime() + duration))
            } else {
                setEndDate(addMinutes(newDate, 60))
            }
        } else {
            setEndDate(addMinutes(newDate, 60)) // Default 1h duration on first pick
        }
        // Do not close popover immediately to allow time selection
    }

    const handleTimeSelect = (timeStr: string) => {
        if (!date) return

        const [hours, minutes] = timeStr.split(':').map(Number)

        // Set Start Time
        const newStartDate = setHours(date, hours)
        const newStartDateWithMinutes = setMinutes(newStartDate, minutes)

        const oldDuration = getDuration() > 0 ? getDuration() : 60 // Default maintain 60m gap if moving start

        setDate(newStartDateWithMinutes)
        // Shift End Time to maintain duration
        setEndDate(addMinutes(newStartDateWithMinutes, oldDuration))
    }

    const setDuration = (minutes: number) => {
        if (date) {
            setEndDate(addMinutes(date, minutes))
        }
    }

    const duration = getDuration()

    return (
        <div className="flex flex-col gap-4 border rounded-md p-4 bg-background/50">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Agendamento (v6)</Label>
                {date && (
                    <span className="text-sm text-muted-foreground capitalize">
                        {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal py-6",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-3 h-5 w-5" />
                            <div className="flex flex-col items-start gap-0.5">
                                {date ? (
                                    <>
                                        <span className="font-semibold text-base">
                                            {format(date, "d 'de' MMMM, yyyy", { locale: ptBR })}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(date, 'HH:mm')} - {endDate ? format(endDate, 'HH:mm') : '--:--'}
                                        </span>
                                    </>
                                ) : (
                                    <span>Selecione data e horário</span>
                                )}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <div className="flex h-[300px]">
                            {/* Calendar Section */}
                            <div className="p-2 border-r">
                                {/* Force hide header rows via injected constraints */}
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    .rdp-head_row, .rdp-head_cell, .rdp-head { display: none !important; }
                                    tr[class*="head_row"] { display: none !important; }
                                `}} />
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                    locale={ptBR}
                                    className="rounded-md border-0"
                                    classNames={{
                                        head_row: "hidden",
                                        head_cell: "hidden",
                                        row: "flex w-full mt-2"
                                    }}
                                />
                            </div>

                            {/* Time Section */}
                            <div className="flex flex-col w-44 border-l">
                                <div className="p-3 border-b bg-muted/30">
                                    <span className="text-xs font-semibold text-muted-foreground">Horário de Início</span>
                                </div>
                                <div className="h-[250px] overflow-y-auto p-2">
                                    <div className="flex flex-col gap-1">
                                        {TIME_SLOTS.map((time) => (
                                            <Button
                                                key={`time-${time}`}
                                                type="button"
                                                variant={date && format(date, 'HH:mm') === time ? "default" : "ghost"}
                                                className={cn(
                                                    "h-8 justify-start font-normal px-3 w-full",
                                                    date && format(date, 'HH:mm') === time && "bg-primary text-primary-foreground"
                                                )}
                                                onClick={() => handleTimeSelect(time)}
                                                disabled={!date}
                                            >
                                                <Clock className="mr-2 h-3.5 w-3.5 opacity-70" />
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Duration Chips - Moved outside for quick access */}
                {date && (
                    <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Duração:</span>
                        <div className="flex flex-wrap gap-2">
                            {[30, 45, 60, 90, 120].map((mins) => (
                                <Button
                                    key={mins}
                                    type="button"
                                    variant={Math.abs(duration - mins) < 1 ? "secondary" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "h-7 text-xs px-3 transition-all",
                                        Math.abs(duration - mins) < 1 && "bg-secondary font-medium"
                                    )}
                                    onClick={() => setDuration(mins)}
                                >
                                    {mins < 60 ? `${mins}m` : `${mins / 60}h${mins % 60 ? (mins % 60) + 'm' : ''}`}
                                </Button>
                            ))}
                        </div>
                    </div>
                )
                }
            </div >
        </div >
    )
}
