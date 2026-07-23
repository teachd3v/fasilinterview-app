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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Loader2, Users, AlertTriangle, Eye, ChevronDown, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react'

type CandidateResult = {
  id: number
  candidateName: string
  interviewerNames: string
  totalScore: number
  hasRedFlag: boolean
  status: string | null
  combinedAspects: any[]
  interviews: any[]
  createdAt: string
  posisiLamaran: string
  photoUrl?: string
}

export function AdminDashboard() {
  const [data, setData] = useState<CandidateResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [candidateToDelete, setCandidateToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [viewNotesCandidate, setViewNotesCandidate] = useState<CandidateResult | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null)
  
  // Photo Upload States
  const [uploadCandidateId, setUploadCandidateId] = useState<number | null>(null)
  const [uploadCandidateName, setUploadCandidateName] = useState<string>('')
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [fullPhotoPreview, setFullPhotoPreview] = useState<string | null>(null)

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

  const handleEdit = async (interviewId: number) => {
    setEditingId(interviewId)
    try {
      const response = await fetch(`/api/candidate-details?id=${interviewId}`)
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
        body: JSON.stringify({ candidateId: candidateToDelete })
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

  const handleUpdateStatus = async (candidateId: number, status: string) => {
    setIsUpdatingStatus(candidateId)
    try {
      const response = await fetch('/api/candidate-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, status })
      })
      const json = await response.json()
      if (json.success) {
        await fetchCandidates()
      } else {
        alert("Gagal mengupdate status: " + json.error)
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan saat mengupdate status.")
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert("Harap pilih file gambar (JPG/PNG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max width/height
        const MAX_DIMENSION = 800;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoPreview(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  const handleUploadPhoto = async () => {
    if (!uploadCandidateId || !photoPreview) return;
    
    setIsUploadingPhoto(true);
    try {
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: uploadCandidateId,
          photoBase64: photoPreview
        })
      });
      const json = await response.json();
      if (json.success) {
        setUploadCandidateId(null);
        setPhotoPreview(null);
        await fetchCandidates();
      } else {
        alert("Gagal upload foto: " + json.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat upload foto.");
    } finally {
      setIsUploadingPhoto(false);
    }
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
      <div className="max-w-7xl mx-auto space-y-6">
        
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
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-white/50 border-b border-white/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[250px] h-12 px-6 font-semibold text-slate-700">Nama Kandidat</TableHead>
                  <TableHead className="h-12 px-6 font-semibold text-slate-700">Interviewer</TableHead>
                  <TableHead className="h-12 px-6 text-center font-semibold text-slate-700">Rata-rata Skor</TableHead>
                  <TableHead className="h-12 px-6 text-center font-semibold text-slate-700">Catatan</TableHead>
                  <TableHead className="h-12 px-6 text-center font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="h-12 px-6 text-right font-semibold text-slate-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white/40">
                {data.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-white/60 transition-colors border-b border-white/50">
                    <TableCell className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-4">
                        {candidate.photoUrl ? (
                          <button 
                            onClick={() => setFullPhotoPreview(candidate.photoUrl!)}
                            className="w-12 h-12 rounded-md object-cover border border-slate-200 shadow-sm overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50"
                            title="Lihat Foto Layar Penuh"
                          >
                            <img src={candidate.photoUrl} alt={candidate.candidateName} className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                        <div>
                          <div className="text-slate-800 text-sm font-semibold">{candidate.candidateName}</div>
                          <div className="text-xs text-slate-500 mt-1 capitalize font-normal flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                            {candidate.posisiLamaran}
                          </div>
                          {candidate.hasRedFlag && (
                            <div className="mt-2">
                               <Badge variant="destructive" className="bg-red-600/90 hover:bg-red-600 text-[10px] py-0"><AlertTriangle className="w-3 h-3 mr-1" /> RED FLAG</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-slate-600">
                      {candidate.interviewerNames || '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-800 text-lg tabular-nums tracking-tight">
                        {candidate.totalScore ? candidate.totalScore.toFixed(1) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setViewNotesCandidate(candidate)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors inline-flex"
                        title="Lihat Catatan Wawancara"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      {candidate.status === 'Lolos' && <Badge className="bg-emerald-500 hover:bg-emerald-600">Lolos</Badge>}
                      {candidate.status === 'Tidak Lolos' && <Badge variant="destructive">Tidak Lolos</Badge>}
                      {!candidate.status && <span className="text-xs text-slate-400 italic">Belum diputuskan</span>}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 bg-white/50 border-primary/20 hover:bg-primary/5 text-primary" disabled={isUpdatingStatus === candidate.id}>
                              {isUpdatingStatus === candidate.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
                              Keputusan <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(candidate.id, 'Lolos')} className="text-emerald-600 font-medium">
                              <CheckCircle className="w-4 h-4 mr-2" /> Lolos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(candidate.id, 'Tidak Lolos')} className="text-red-600 font-medium">
                              <XCircle className="w-4 h-4 mr-2" /> Tidak Lolos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 bg-white/50 border-blue-200 hover:bg-blue-50 text-blue-600" disabled={editingId !== null}>
                              {editingId !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                              Edit Form <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {candidate.interviews.map((inv: any) => (
                              <DropdownMenuItem key={inv.id} onClick={() => handleEdit(inv.id)}>
                                Edit Form ({inv.interviewerName})
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 bg-white/50 border-purple-200 hover:bg-purple-50 text-purple-600"
                          onClick={() => {
                            setUploadCandidateId(candidate.id);
                            setUploadCandidateName(candidate.candidateName);
                            setPhotoPreview(null);
                          }}
                        >
                          <ImageIcon className="w-3 h-3 mr-1" /> {candidate.photoUrl ? 'Ganti Foto' : 'Upload Foto'}
                        </Button>

                        <button 
                          onClick={() => setCandidateToDelete(candidate.id)}
                          className="text-red-600 text-sm font-semibold hover:text-red-700 transition-colors bg-white/50 px-3 py-1.5 rounded-md border border-red-200 shadow-sm"
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

      {/* Catatan Dialog */}
      <Dialog open={!!viewNotesCandidate} onOpenChange={(open) => !open && setViewNotesCandidate(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[80vw] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              Catatan Evaluasi: {viewNotesCandidate?.candidateName}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Berikut adalah gabungan catatan dari semua interviewer untuk kandidat ini.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {viewNotesCandidate?.combinedAspects.map((ca: any, index: number) => (
              <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="font-semibold text-primary mb-3 pb-2 border-b border-slate-200">Interviewer: {ca.interviewerName}</h4>
                {ca.aspectResults && ca.aspectResults.length > 0 ? (
                   <div className="space-y-4">
                     {ca.aspectResults.map((aspect: any, idx: number) => (
                       <div key={idx} className="bg-white p-3 rounded border border-slate-100 shadow-sm">
                         <div className="flex justify-between items-start mb-1">
                           <span className="font-medium text-slate-800 text-sm">{aspect.title}</span>
                           <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
                             Rata-rata: {aspect.averageScore} | Tertimbang: {aspect.weightedScore}
                           </span>
                         </div>
                         <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{aspect.note || <span className="italic text-slate-400">Tidak ada catatan khusus.</span>}</p>
                       </div>
                     ))}
                   </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Belum ada catatan yang tersimpan.</p>
                )}
              </div>
            ))}
          </div>
          
          {viewNotesCandidate?.photoUrl && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" /> Foto Dokumentasi Wawancara
              </p>
              <img src={viewNotesCandidate.photoUrl} alt="Dokumentasi Wawancara" className="max-w-md w-full max-h-80 object-contain rounded-lg border border-slate-200 bg-white shadow-sm" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!candidateToDelete} onOpenChange={(open) => !open && !isDeleting && setCandidateToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Konfirmasi Hapus Data
            </DialogTitle>
            <DialogDescription className="pt-3 text-slate-600">
              Apakah Anda yakin ingin menghapus <strong>seluruh data kandidat</strong> ini beserta hasil wawancaranya? 
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

      {/* Upload Photo Dialog */}
      <Dialog open={!!uploadCandidateId} onOpenChange={(open) => !open && !isUploadingPhoto && setUploadCandidateId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <ImageIcon className="w-5 h-5 text-primary" /> Upload Foto Wawancara
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Kandidat: <strong>{uploadCandidateName}</strong><br/>
              *Foto ini berlaku sebagai dokumentasi untuk 2 interviewer sekaligus.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20
                cursor-pointer"
            />
            {photoPreview && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Preview (Otomatis Dikompres):</p>
                <img src={photoPreview} alt="Preview" className="w-full rounded-md border border-slate-200 shadow-sm max-h-60 object-contain bg-slate-50" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setUploadCandidateId(null)}
              disabled={isUploadingPhoto}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleUploadPhoto}
              disabled={!photoPreview || isUploadingPhoto}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isUploadingPhoto ? 'Mengupload...' : 'Simpan Foto'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Photo Preview Dialog */}
      <Dialog open={!!fullPhotoPreview} onOpenChange={(open) => !open && setFullPhotoPreview(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl p-1 bg-transparent border-none shadow-none">
          <div className="relative flex items-center justify-center">
            {fullPhotoPreview && (
              <img src={fullPhotoPreview} alt="Preview Wawancara" className="max-w-full max-h-[85vh] object-contain rounded-md" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
