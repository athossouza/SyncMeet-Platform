import { addMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
    Box,
    Button,
    Typography,
    Stack,
    Chip
} from '@mui/material'

interface SessionSchedulerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    endDate: Date | undefined
    setEndDate: (date: Date | undefined) => void
}

export function SessionScheduler({
    date,
    setDate,
    endDate,
    setEndDate,
}: SessionSchedulerProps) {

    const setDuration = (minutes: number) => {
        if (date) {
            setEndDate(addMinutes(date, minutes))
        }
    }

    const currentDuration = date && endDate
        ? (endDate.getTime() - date.getTime()) / 60000
        : 0

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Agendamento
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Selecione a data de início e fim.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                        <DateTimePicker
                            label="Início"
                            value={date}
                            onChange={(newValue) => {
                                setDate(newValue || undefined)
                                // Auto-set end date if undefined
                                if (newValue && !endDate) {
                                    setEndDate(addMinutes(newValue, 60))
                                }
                            }}
                            slotProps={{ textField: { fullWidth: true } }}
                            ampm={false}
                        />
                        <DateTimePicker
                            label="Fim"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue || undefined)}
                            slotProps={{ textField: { fullWidth: true } }}
                            ampm={false}
                            minDateTime={date}
                        />
                    </Stack>
                </Box>

                {date && (
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                Duração Rápida
                            </Typography>
                            {currentDuration > 0 && (
                                <Chip
                                    label={currentDuration < 60 ? `${currentDuration}m` : `${currentDuration / 60}h`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                            )}
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {[30, 45, 60, 90, 120].map((mins) => (
                                <Button
                                    key={mins}
                                    variant={Math.abs(currentDuration - mins) < 1 ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => setDuration(mins)}
                                    color={Math.abs(currentDuration - mins) < 1 ? "primary" : "inherit"}
                                    sx={{
                                        borderRadius: 10,
                                        borderColor: 'divider',
                                        color: Math.abs(currentDuration - mins) < 1 ? 'primary.contrastText' : 'text.secondary'
                                    }}
                                >
                                    {mins < 60 ? `${mins}m` : `${mins / 60}h${mins % 60 ? (mins % 60) + 'm' : ''}`}
                                </Button>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Box>
        </LocalizationProvider>
    )
}
