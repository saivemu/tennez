import { create } from 'zustand'
import { toDateParam } from '@/lib/utils/dates'

interface DateStore {
  date: Date
  dateParam: string
  setDate: (date: Date) => void
}

export const useDateStore = create<DateStore>(set => ({
  date: new Date(),
  dateParam: toDateParam(new Date()),
  setDate: (date: Date) => set({ date, dateParam: toDateParam(date) }),
}))
