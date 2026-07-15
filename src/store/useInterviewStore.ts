import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CandidateData {
  interviewerName: string
  candidateName: string
  ipk: number
  semester: number
  potentialSkill: string
}

export interface IndicatorScore {
  score: 1 | 2 | 3 | null
  note: string
}

interface InterviewState {
  editingInterviewId: number | null
  candidateData: CandidateData | null
  setCandidateData: (data: CandidateData) => void
  scores: Record<string, IndicatorScore>
  setScore: (indicatorId: string, score: 1 | 2 | 3) => void
  aspectNotes: Record<string, string>
  setAspectNote: (aspectId: string, note: string) => void
  currentAspectIndex: number
  setCurrentAspectIndex: (index: number) => void
  resetInterview: () => void
  setEditMode: (interviewId: number, candidate: CandidateData, scores: Record<string, IndicatorScore>, aspectNotes?: Record<string, string>) => void
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      editingInterviewId: null,
      candidateData: null,
      setCandidateData: (data) => set({ candidateData: data }),
      scores: {},
      setScore: (indicatorId, score) =>
        set((state) => ({
          scores: {
            ...state.scores,
            [indicatorId]: { ...state.scores[indicatorId], score, note: state.scores[indicatorId]?.note || '' },
          },
        })),
      aspectNotes: {},
      setAspectNote: (aspectId, note) =>
        set((state) => ({
          aspectNotes: {
            ...state.aspectNotes,
            [aspectId]: note,
          },
        })),
      currentAspectIndex: 0,
      setCurrentAspectIndex: (index) => set({ currentAspectIndex: index }),
      resetInterview: () => set({ editingInterviewId: null, candidateData: null, scores: {}, aspectNotes: {}, currentAspectIndex: 0 }),
      setEditMode: (id, candidate, scores, aspectNotes) => set({ editingInterviewId: id, candidateData: candidate, scores, aspectNotes: aspectNotes || {}, currentAspectIndex: 0 }),
    }),
    {
      name: 'interview-storage',
    }
  )
)
