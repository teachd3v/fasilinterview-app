import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterviewStore } from '../store/useInterviewStore'
import { rubricData } from '../data/rubric'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, ChevronLeft, Loader2, Send } from 'lucide-react'
import confetti from 'canvas-confetti'

export function SubmissionScreen() {
  const navigate = useNavigate()
  const { candidateData, scores, aspectNotes, resetInterview, editingInterviewId } = useInterviewStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Redirect if no data
  useEffect(() => {
    if (!candidateData) {
      navigate('/')
    }
  }, [candidateData, navigate])



  // Calculate scores
  const { totalScore, category, hasRedFlag, aspectResults } = useMemo(() => {
    let total = 0
    let hasRedFlag = false
    const results = []

    for (const aspect of rubricData) {
      let aspectTotal = 0
      let answeredCount = 0

      for (const ind of aspect.indicators) {
        const score = scores[ind.id]?.score || 0
        if (score > 0) {
          aspectTotal += score
          answeredCount++
        }
        if (aspect.isCritical && score === 1) {
          hasRedFlag = true
        }
      }

      const averageScore = answeredCount > 0 ? aspectTotal / answeredCount : 0
      const weightedScore = (averageScore / 3) * aspect.weight
      total += weightedScore

      results.push({
        id: aspect.id,
        title: aspect.title,
        weight: aspect.weight,
        averageScore: averageScore.toFixed(2),
        weightedScore: weightedScore.toFixed(2),
        note: aspectNotes[aspect.id] || ""
      })
    }

    let category = "TIDAK DIREKOMENDASIKAN"
    if (!hasRedFlag) {
      if (total >= 85) category = "SANGAT DIREKOMENDASIKAN"
      else if (total >= 70) category = "DIREKOMENDASIKAN DENGAN CATATAN"
      else if (total >= 55) category = "DIPERTIMBANGKAN / PERLU PENDALAMAN"
    }

    return { totalScore: total.toFixed(2), category, hasRedFlag, aspectResults: results }
  }, [scores, aspectNotes])

  useEffect(() => {
    if (isSuccess) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, particleCount,
          origin: { x: Math.random() - 0.2, y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, particleCount,
          origin: { x: Math.random() + 0.2, y: Math.random() - 0.2 }
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [isSuccess])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Create the payload
    const payload = {
      interviewId: editingInterviewId,
      candidate: candidateData,
      evaluation: scores,
      finalScore: parseFloat(totalScore),
      category,
      hasRedFlag,
      aspectResults // ADD THIS!
    }

    try {
      const response = await fetch('/api/evaluate', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend Error Response:', errorData);
        throw new Error(errorData.details || errorData.error || 'Gagal menyimpan data');
      }
      
      const result = await response.json()
      console.log('Payload Submitted:', result)
      setIsSuccess(true)
    } catch (error: any) {
      console.error(error)
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = () => {
    navigate('/')
    setTimeout(() => resetInterview(), 100)
  }

  if (!candidateData) {
    return null
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background shapes for glass effect */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-60 pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[100px] opacity-60 pointer-events-none z-0" />
        <Card className="w-full max-w-md text-center py-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/80 z-10 relative bg-white/60 backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 mb-2">Evaluasi Selesai!</CardTitle>
          <CardDescription className="text-slate-600 mb-8 px-6">
            Data wawancara kandidat <strong className="text-slate-800">{candidateData.candidateName}</strong> telah berhasil disimpan ke database.
          </CardDescription>
          <div className="flex justify-center gap-3">
            <Button onClick={handleFinish} variant="outline" size="sm" className="px-6 rounded-full font-medium">
              Kembali ke Form
            </Button>
            <Button onClick={() => { navigate('/admin'); setTimeout(() => resetInterview(), 100); }} size="sm" className="px-6 rounded-full shadow-md hover:shadow-lg transition-all font-medium">
              Lanjut ke Admin
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Decorative background shapes for glass effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-60 pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[100px] opacity-60 pointer-events-none z-0" />

      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/evaluate')}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors bg-white/50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Form
          </button>
          
          <button 
            onClick={() => {
              navigate('/admin')
              setTimeout(() => resetInterview(), 100)
            }}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors bg-white/50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
          >
            Kembali ke Admin
          </button>
        </div>

        <Card className="border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden bg-white/60 backdrop-blur-xl">
          <CardHeader className="bg-white/40 border-b border-white/60 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Review & Rekapitulasi</CardTitle>
            <CardDescription className="text-slate-500">
              Periksa kembali kalkulasi skor sementara sebelum mengirimkan data secara permanen.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="bg-slate-50/50 pt-6">
            {/* Profil Singkat */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Kandidat</p>
                <p className="font-semibold text-slate-700">{candidateData.candidateName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pewawancara</p>
                <p className="font-semibold text-slate-700">{candidateData.interviewerName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Kampus / Prodi</p>
                <p className="font-semibold text-slate-700">{candidateData.kampus} / {candidateData.prodi}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Posisi / Wilayah</p>
                <p className="font-semibold text-slate-700 capitalize">{candidateData.posisiLamaran} / {candidateData.wilayahPendaftaran}</p>
              </div>
            </div>

            {/* Hasil Akhir */}
            <div className={`p-6 rounded-xl border-2 mb-8 ${hasRedFlag ? 'bg-red-50 border-red-200' : 'bg-primary/5 border-primary/20'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Total Skor Tertimbang</p>
                  <div className="text-4xl font-black text-slate-800">
                    {totalScore}<span className="text-lg text-slate-400 font-medium"> / 100</span>
                  </div>
                </div>
                
                <div className="flex-1 md:text-right">
                  <p className="text-sm font-semibold text-slate-600 mb-2">Rekomendasi Sistem</p>
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg font-bold text-sm text-white ${
                    hasRedFlag || category === "TIDAK DIREKOMENDASIKAN" ? "bg-red-600" 
                    : category.includes("SANGAT") ? "bg-emerald-600"
                    : category.includes("CATATAN") ? "bg-blue-600"
                    : "bg-amber-500"
                  }`}>
                    {hasRedFlag && <AlertTriangle className="w-4 h-4 mr-2" />}
                    {hasRedFlag ? "TIDAK DIREKOMENDASIKAN (RED FLAG)" : category}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel Rincian */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">Aspek Penilaian</th>
                      <th className="px-4 py-3 text-center">Bobot</th>
                      <th className="px-4 py-3 text-center">Rata-rata Skor</th>
                      <th className="px-4 py-3 text-right">Tertimbang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aspectResults.map((res, i) => (
                      <React.Fragment key={i}>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-700">{res.title}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{res.weight}%</td>
                          <td className="px-4 py-3 text-center font-medium text-slate-700">{res.averageScore}</td>
                          <td className="px-4 py-3 text-right font-semibold text-primary">{res.weightedScore}</td>
                        </tr>
                        {res.note && (
                          <tr className="bg-slate-50/30">
                            <td colSpan={4} className="px-4 py-2 border-t-0 pb-3">
                              <div className="bg-white p-3 rounded-md border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Catatan Aspek</p>
                                <p className="text-xs text-slate-600 italic leading-relaxed">{res.note}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </CardContent>
          <CardFooter className="bg-white p-6 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => navigate('/evaluate')} disabled={isSubmitting}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[140px] shadow-md">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Submit Final</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
