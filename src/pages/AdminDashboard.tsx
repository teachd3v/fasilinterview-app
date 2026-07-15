import { useEffect, useState } from 'react'
import { useInterviewStore } from '../store/useInterviewStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Users, CheckCircle2, AlertTriangle, FileText } from 'lucide-react'

type CandidateResult = {
  id: number
  candidateName: string
  interviewerName: string
  ipk: number
  semester: number
  potentialSkill: string
  totalScore: number
  category: string
  hasRedFlag: boolean
  aspectResults: any
  createdAt: string
}

export function AdminDashboard() {
  const [data, setData] = useState<CandidateResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [candidateToDelete, setCandidateToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates')
      const json = await response.json()
      if (json.success) {
        setData(json.data)
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleEdit = async (id: number) => {
    setEditingId(id)
    try {
      const response = await fetch(`/api/candidate-details?id=${id}`)
      const json = await response.json()
      if (json.success) {
        useInterviewStore.getState().setEditMode(
          json.data.interviewId, 
          json.data.candidate, 
          json.data.scores,
          json.data.aspectNotes
        )
        window.location.href = '/evaluate'
      } else {
        alert("Gagal memuat data: " + json.error)
        setEditingId(null)
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan saat memuat data.")
      setEditingId(null)
    }
  }

  const handleDelete = async () => {
    if (!candidateToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId: candidateToDelete })
      })
      const json = await response.json()
      if (json.success) {
        setCandidateToDelete(null)
        await fetchCandidates()
      } else {
        alert("Gagal menghapus data: " + json.error)
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan saat menghapus data.")
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoryBadge = (category: string, hasRedFlag: boolean) => {
    if (hasRedFlag) {
      return <Badge variant="destructive" className="bg-red-600"><AlertTriangle className="w-3 h-3 mr-1" /> RED FLAG</Badge>
    }
    if (category.includes('SANGAT')) {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Sangat Direkomendasikan</Badge>
    }
    if (category.includes('CATATAN')) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Dengan Catatan</Badge>
    }
    if (category.includes('DIPERTIMBANGKAN')) {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Perlu Pendalaman</Badge>
    }
    return <Badge variant="destructive">Tidak Lolos</Badge>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Rekapitulasi Hasil Wawancara Calon Fasilitator Etos ID</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-white/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Kandidat</p>
              <p className="text-xl font-bold text-slate-800">{data.length}</p>
            </div>
          </div>
        </div>

        <Card className="bg-white/60 backdrop-blur-xl shadow-lg border border-white/80 overflow-hidden">
          <CardHeader className="bg-white/40 border-b border-white/60">
            <CardTitle className="text-lg">Daftar Kandidat</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-white/50 border-b border-white/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[280px] h-12 px-6 font-semibold text-slate-700">Nama Kandidat</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-slate-700">Pewawancara</TableHead>
                  <TableHead className="h-12 px-6 text-center font-semibold text-slate-700">IPK</TableHead>
                  <TableHead className="h-12 px-6 text-center font-semibold text-slate-700">Skor Akhir</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-slate-700">Keputusan Akhir</TableHead>
                  <TableHead className="h-12 px-6 text-right font-semibold text-slate-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white/40">
                {data.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-white/60 transition-colors border-b border-white/50">
                    <TableCell className="px-6 py-4 font-medium">
                      <div className="text-slate-800 text-sm">{candidate.candidateName}</div>
                      <div className="text-xs text-slate-500 mt-1 capitalize font-normal flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                        {candidate.potentialSkill.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-slate-600">{candidate.interviewerName}</TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-slate-100/80 px-2 py-1 rounded-md text-xs font-semibold text-slate-600">
                        {candidate.ipk.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-800 text-lg tabular-nums tracking-tight">
                        {candidate.totalScore.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getCategoryBadge(candidate.category, candidate.hasRedFlag)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => window.location.href = `/admin/detail/${candidate.id}`}
                          className="text-primary text-sm font-semibold hover:text-emerald-600 transition-colors bg-white/50 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm"
                          title="Lihat Detail"
                        >
                          Detail
                        </button>
                        <button 
                          onClick={() => handleEdit(candidate.id)}
                          disabled={editingId === candidate.id}
                          className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors bg-white/50 px-3 py-1.5 rounded-full border border-blue-200 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                          title="Edit Data"
                        >
                          {editingId === candidate.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          {editingId === candidate.id ? 'Loading' : 'Edit'}
                        </button>
                        <button 
                          onClick={() => setCandidateToDelete(candidate.id)}
                          className="text-red-600 text-sm font-semibold hover:text-red-700 transition-colors bg-white/50 px-3 py-1.5 rounded-full border border-red-200 shadow-sm"
                          title="Hapus Data"
                        >
                          Hapus
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mb-3 shadow-sm">
                          <Users className="w-6 h-6 text-slate-300" />
                        </div>
                        <p>Belum ada data wawancara yang masuk.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>



      {/* Delete Confirmation Dialog */}
      <Dialog open={!!candidateToDelete} onOpenChange={(open) => !open && !isDeleting && setCandidateToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Konfirmasi Hapus Data
            </DialogTitle>
            <DialogDescription className="pt-3 text-slate-600">
              Apakah Anda yakin ingin menghapus data wawancara ini secara permanen? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setCandidateToDelete(null)}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
