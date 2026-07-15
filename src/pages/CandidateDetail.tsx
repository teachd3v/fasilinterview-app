import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ChevronLeft, AlertTriangle } from 'lucide-react'

export function CandidateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/candidate-details?id=${id}`)
        const json = await response.json()
        if (json.success) {
          setData(json.data)
        } else {
          alert('Gagal memuat detail kandidat')
        }
      } catch (error) {
        console.error(error)
        alert('Terjadi kesalahan saat memuat data.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (id) {
      fetchDetails()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) return null

  const { candidate, totalScore, category, hasRedFlag, aspectResults } = data

  const getCategoryBadge = (cat: string, isRedFlag: boolean) => {
    if (isRedFlag) {
      return <Badge variant="destructive" className="bg-red-600 px-3 py-1 text-sm"><AlertTriangle className="w-4 h-4 mr-1.5" /> RED FLAG</Badge>
    }
    if (cat.includes('SANGAT')) {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-sm">Sangat Direkomendasikan</Badge>
    }
    if (cat.includes('CATATAN')) {
      return <Badge className="bg-blue-500 hover:bg-blue-600 px-3 py-1 text-sm">Dengan Catatan</Badge>
    }
    if (cat.includes('DIPERTIMBANGKAN')) {
      return <Badge className="bg-amber-500 hover:bg-amber-600 px-3 py-1 text-sm">Perlu Pendalaman</Badge>
    }
    return <Badge variant="destructive" className="px-3 py-1 text-sm">Tidak Lolos</Badge>
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden bg-slate-50/50">
      {/* Decorative background shapes for glass effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-60 pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[100px] opacity-60 pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Admin Dashboard
        </button>

        <Card className="bg-white/60 backdrop-blur-xl shadow-lg border border-white/80 overflow-hidden">
          <CardHeader className="bg-white/40 border-b border-white/60 pb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold text-slate-800 tracking-tight">{candidate.candidateName}</CardTitle>
              <CardDescription className="text-slate-500 mt-2 text-base flex flex-wrap items-center gap-2">
                <span>Pewawancara: <strong>{candidate.interviewerName}</strong></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden md:block" />
                <span>IPK: <strong>{candidate.ipk}</strong> (Smt {candidate.semester})</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden md:block" />
                <span className="capitalize">Potensi: <strong>{candidate.potentialSkill.replace('_', ' ')}</strong></span>
              </CardDescription>
            </div>
            <div className="md:text-right">
              <div className="text-4xl font-black text-slate-800 tracking-tight">
                {parseFloat(totalScore).toFixed(1)}
              </div>
              <div className="mt-2 flex justify-start md:justify-end">
                {getCategoryBadge(category, hasRedFlag)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Rincian Nilai per Aspek</h3>
            
            <div className="grid gap-4">
              {aspectResults?.map((res: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-base">{res.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                          Bobot {res.weight}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 md:justify-end">
                      <div className="text-center bg-slate-50 px-4 py-2 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Rata-rata</p>
                        <p className="font-semibold text-slate-700 text-lg">{res.averageScore}</p>
                      </div>
                      <div className="text-center bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
                        <p className="text-[10px] uppercase font-bold text-primary/60 mb-0.5 tracking-wider">Tertimbang</p>
                        <p className="font-black text-primary text-lg">{res.weightedScore}</p>
                      </div>
                    </div>
                  </div>
                  
                  {res.note && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 rounded-l-xl"></div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Catatan Pewawancara</p>
                      <p className="text-sm text-slate-700 italic leading-relaxed">{res.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
