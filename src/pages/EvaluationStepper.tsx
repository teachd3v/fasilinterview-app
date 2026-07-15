import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewStore } from '../store/useInterviewStore'
import { rubricData } from '../data/rubric'
import { Button } from '@/components/ui/button'

import { CheckCircle2, ChevronLeft, ChevronRight, AlertTriangle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EvaluationStepper() {
  const navigate = useNavigate()
  const { currentAspectIndex, setCurrentAspectIndex, scores, setScore, aspectNotes, setAspectNote, candidateData } = useInterviewStore()

  useEffect(() => {
    if (!candidateData) {
      navigate('/')
    }
  }, [candidateData, navigate])

  const aspect = rubricData[currentAspectIndex]
  const isLastAspect = currentAspectIndex === rubricData.length - 1

  // Check if current aspect is fully answered
  const isCurrentAspectComplete = aspect?.indicators.every(ind => 
    scores[ind.id]?.score
  )

  const handleNext = useCallback(() => {
    if (isCurrentAspectComplete) {
      if (isLastAspect) {
        navigate('/submission')
      } else {
        setCurrentAspectIndex(currentAspectIndex + 1)
      }
    }
  }, [isCurrentAspectComplete, isLastAspect, currentAspectIndex, navigate, setCurrentAspectIndex])

  const handlePrev = () => {
    if (currentAspectIndex > 0) {
      setCurrentAspectIndex(currentAspectIndex - 1)
    }
  }

  // Handle Enter Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (isCurrentAspectComplete) {
          e.preventDefault()
          handleNext()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCurrentAspectComplete, handleNext])

  if (!aspect) return null

  return (
    <div className="h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Decorative background shapes for glass effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-60 pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl opacity-60 pointer-events-none z-0" />

      {/* KIRI: Sidebar Navigasi */}
      <aside className="w-full md:w-64 bg-white/40 backdrop-blur-xl border-r border-white/60 md:h-screen overflow-y-auto shrink-0 shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-10 hidden md:block">
        <div className="p-4 border-b border-white/60 sticky top-0 bg-white/40 backdrop-blur-xl z-10">
          <h2 className="font-bold text-base text-slate-800">Progress Evaluasi</h2>
          <p className="text-xs text-slate-500 mt-1">{candidateData?.candidateName}</p>
        </div>
        <div className="p-4 space-y-2">
          {rubricData.map((a, idx) => {
            const isCompleted = a.indicators.every(ind => scores[ind.id]?.score)
            const isActive = idx === currentAspectIndex
            return (
              <button
                key={a.id}
                onClick={() => setCurrentAspectIndex(idx)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200",
                  isActive ? "bg-primary/5 shadow-sm ring-1 ring-primary/20" : "hover:bg-slate-50",
                  !isCompleted && !isActive ? "opacity-70" : ""
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <div className={cn(
                    "text-sm font-medium leading-snug",
                    isActive ? "text-primary" : isCompleted ? "text-slate-700" : "text-slate-500"
                  )}>
                    {a.title}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* TENGAH: Main Content */}
      <main className="flex-1 flex flex-col min-h-screen pb-16">
        <div className="flex-1 p-4 md:px-8 md:py-4 max-w-4xl w-full mx-auto">
          
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{aspect.title}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                Bobot {aspect.weight}%
              </span>
              {aspect.isCritical && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3" /> Syarat Mutlak
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {aspect.indicators.map((indicator, idx) => {
              const currentScore = scores[indicator.id]?.score

              
              // Red flag check for indicator 22 and 23 (Syarat Mutlak)
              const showRedFlag = aspect.isCritical && currentScore === 1

              return (
                <div key={indicator.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-slate-800 mb-0.5">{indicator.title}</h3>
                    <p className="text-xs text-slate-600 font-medium">{indicator.question}</p>
                  </div>

                  {/* Radio Selectable Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                    {indicator.scores.map((s) => {
                      const isSelected = currentScore === s.score
                      let colorClass = ""
                      if (s.score === 1) colorClass = isSelected ? "ring-red-500 bg-red-50 border-red-200" : "hover:border-red-200 hover:bg-red-50/50"
                      if (s.score === 2) colorClass = isSelected ? "ring-amber-500 bg-amber-50 border-amber-200" : "hover:border-amber-200 hover:bg-amber-50/50"
                      if (s.score === 3) colorClass = isSelected ? "ring-emerald-500 bg-emerald-50 border-emerald-200" : "hover:border-emerald-200 hover:bg-emerald-50/50"
                      
                      return (
                        <button
                          key={s.score}
                          type="button"
                          onClick={() => setScore(indicator.id, s.score)}
                          className={cn(
                            "relative p-2 rounded-lg border-2 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                            isSelected ? `ring-1 ring-offset-1 border-transparent shadow-sm ${colorClass}` : "border-slate-200 bg-white/60 shadow-sm",
                            !isSelected && colorClass
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={cn(
                              "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                              isSelected 
                                ? s.score === 1 ? "bg-red-500 text-white" : s.score === 2 ? "bg-amber-500 text-white" : "bg-emerald-500 text-white" 
                                : "bg-slate-200 text-slate-500"
                            )}>
                              {s.score}
                            </span>
                            <span className="font-semibold text-xs text-slate-700">
                              {s.score === 1 ? "Belum Memenuhi" : s.score === 2 ? "Cukup Memenuhi" : "Memenuhi dgn Baik"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-tight">{s.description}</p>
                        </button>
                      )
                    })}
                  </div>

                  {/* Red Flag Warning */}
                  {showRedFlag && (
                    <div className="mb-3 p-2 rounded-md bg-red-50 border border-red-200 flex gap-2 items-start animate-in zoom-in-95 duration-300">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-bold text-red-800">Peringatan: Syarat Mutlak Tidak Terpenuhi</h4>
                        <p className="text-[10px] text-red-700">
                          Kandidat mendapat skor 1. Ini pertimbangan kuat untuk TIDAK meloloskan kandidat.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Smart Textarea per Aspek */}
          {isCurrentAspectComplete && (
            <div className="mt-8 animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Keseluruhan Aspek <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
              </label>
              <textarea
                value={aspectNotes[aspect.id] || ''}
                onChange={(e) => setAspectNote(aspect.id, e.target.value)}
                placeholder="Berikan catatan singkat... (Tekan Enter untuk lanjut, Shift+Enter untuk baris baru)"
                className="w-full min-h-[60px] p-2 rounded-md border-2 border-slate-200 bg-white/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y text-[12px] text-slate-700 shadow-sm"
              />
            </div>
          )}

        </div>

        {/* BAWAH: Sticky Footer */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-slate-200 p-3 z-20 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentAspectIndex === 0}
              className="gap-1.5 font-medium text-xs h-8"
            >
              <ChevronLeft className="w-3 h-3" /> Kembali
            </Button>
            
            <Button
              type="button"
              size="sm"
              onClick={handleNext}
              disabled={!isCurrentAspectComplete}
              className="gap-1.5 font-medium px-6 shadow-sm text-xs h-8 rounded-full"
            >
              {isLastAspect ? 'Review & Submit (Enter)' : 'Simpan & Lanjut (Enter)'} <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
