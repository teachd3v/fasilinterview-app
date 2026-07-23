import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Papa from 'papaparse'
import { useInterviewStore } from '../store/useInterviewStore'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Briefcase, User, UserCircle } from 'lucide-react'

// Import CSV as raw string
import candidatesCsvString from '../../data_kandidat_fasil.csv?raw'

const formSchema = z.object({
  interviewerName: z.string().min(2, "Data Interviewer wajib dipilih"),
  candidateName: z.string().min(2, "Nama Kandidat wajib dipilih"),
  jenisKelamin: z.string(),
  posisiLamaran: z.string(),
  wilayahPendaftaran: z.string(),
  kampus: z.string(),
  prodi: z.string(),
  ipk: z.string(),
  lamaStudi: z.string(),
  tautanBerkas: z.string()
})

const INTERVIEWERS = [
  "Bayu Candra Winata",
  "Dwi Nurfitriani",
  "Akbar Alghifary",
  "Rista Damayanti"
];

export function OnboardingScreen() {
  const navigate = useNavigate()
  const { setCandidateData } = useInterviewStore()
  
  const [candidatesList, setCandidatesList] = useState<any[]>([])
  const [evaluatedData, setEvaluatedData] = useState<any[]>([])

  useEffect(() => {
    // Parse CSV on mount
    Papa.parse(candidatesCsvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Clean up headers (remove extra spaces)
        const cleanedData = results.data.map((row: any) => {
          const cleanedRow: any = {};
          for (let key in row) {
            cleanedRow[key.trim()] = row[key];
          }
          return cleanedRow;
        });
        setCandidatesList(cleanedData);
      }
    });

    // Fetch evaluated candidates to check interview counts
    const fetchEvaluated = async () => {
      try {
        const response = await fetch('/api/candidates')
        const json = await response.json()
        if (json.success) {
          setEvaluatedData(json.data)
        }
      } catch (error) {
        console.error('Failed to fetch evaluated candidates', error)
      }
    }
    fetchEvaluated()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      interviewerName: "",
      candidateName: "",
      jenisKelamin: "",
      posisiLamaran: "",
      wilayahPendaftaran: "",
      kampus: "",
      prodi: "",
      ipk: "",
      lamaStudi: "",
      tautanBerkas: ""
    }
  })

  // Watch candidate name to auto-fill details
  const selectedCandidateName = form.watch("candidateName");

  const getInterviewCount = (name: string) => {
    const cand = evaluatedData.find(c => c.candidateName === name);
    return cand ? cand.interviews.length : 0;
  }

  const isFullyEvaluated = selectedCandidateName ? getInterviewCount(selectedCandidateName) >= 2 : false;

  useEffect(() => {
    if (selectedCandidateName && candidatesList.length > 0) {
      const found = candidatesList.find(c => c["Nama"] === selectedCandidateName);
      if (found) {
        form.setValue("jenisKelamin", found["Jenis Kelamin"] || "");
        form.setValue("posisiLamaran", found["Posisi Lamaran"] || "");
        form.setValue("wilayahPendaftaran", found["Wilayah Pendaftaran"] || "");
        form.setValue("kampus", found["Kampus"] || "");
        form.setValue("prodi", found["Prodi"] || "");
        form.setValue("ipk", found["IPK"] || "");
        form.setValue("lamaStudi", found["Lama Studi"] || "");
        form.setValue("tautanBerkas", found["Tautan Berkas GDrive"] || "");
      }
    }
  }, [selectedCandidateName, candidatesList, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setCandidateData(values)
    navigate('/evaluate')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background shapes for glass effect */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <Card className="w-full max-w-4xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden relative z-10">
        <CardHeader className="bg-white/40 border-b border-white/60 p-8 text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-semibold tracking-wider text-primary/80 uppercase">Etos ID</h2>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Form Wawancara Fasilitator</CardTitle>
          <CardDescription className="text-slate-600">
            Pilih nama Anda dan nama kandidat yang akan diwawancarai.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)}>
            <CardContent className="pt-6 pb-6 px-8 bg-white/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Kiri: Pilihan */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/60 pb-1 mb-2">
                      <UserCircle className="w-4 h-4 text-primary/70" />
                      <h3 className="text-sm font-semibold text-slate-700">Data Interviewer</h3>
                    </div>
                    <FormField
                      control={form.control as any}
                      name="interviewerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Nama Interviewer</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm bg-white/50 focus:bg-white transition-colors">
                                <SelectValue placeholder="Pilih nama Anda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INTERVIEWERS.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/60 pb-1 mb-2">
                      <User className="w-4 h-4 text-primary/70" />
                      <h3 className="text-sm font-semibold text-slate-700">Pilih Kandidat</h3>
                    </div>
                    <FormField
                      control={form.control as any}
                      name="candidateName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Nama Kandidat</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-sm bg-white/50 focus:bg-white transition-colors">
                                <SelectValue placeholder="Pilih kandidat" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {candidatesList.map((c, i) => {
                                const count = getInterviewCount(c["Nama"]);
                                const displayCount = count > 2 ? 2 : count;
                                let badgeText = "";
                                if (displayCount === 1) {
                                  badgeText = " (1 Interview)";
                                } else if (displayCount === 2) {
                                  badgeText = " ✓ (2 Interview)";
                                }
                                return (
                                  <SelectItem key={i} value={c["Nama"]}>
                                    {c["Nama"]}{badgeText}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          {isFullyEvaluated && (
                            <p className="text-xs font-semibold text-red-500 mt-2">
                              Kandidat ini sudah dievaluasi oleh 2 interviewer.
                            </p>
                          )}
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Kanan: Detail Kandidat Read-Only */}
                <div className="space-y-4 bg-white/30 p-4 rounded-xl border border-white/50">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 border-b border-white/60 pb-1">Detail Kandidat (Otomatis)</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Jenis Kelamin</p>
                      <p className="text-sm text-slate-800 font-medium">{form.watch("jenisKelamin") || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Posisi Lamaran</p>
                      <p className="text-sm text-slate-800 font-medium">{form.watch("posisiLamaran") || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Wilayah Pendaftaran</p>
                      <p className="text-sm text-slate-800 font-medium">{form.watch("wilayahPendaftaran") || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Kampus</p>
                      <p className="text-sm text-slate-800 font-medium">{form.watch("kampus") || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Prodi</p>
                      <p className="text-sm text-slate-800 font-medium">{form.watch("prodi") || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">IPK</p>
                      <p className="text-sm text-slate-800 font-medium">{form.watch("ipk") || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Lama Studi</p>
                      <p className="text-sm text-slate-800 font-medium line-clamp-2" title={form.watch("lamaStudi")}>{form.watch("lamaStudi") || "-"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Tautan Berkas GDrive</p>
                      {form.watch("tautanBerkas") ? (
                        <a href={form.watch("tautanBerkas")} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium break-all">
                          Buka Link GDrive
                        </a>
                      ) : (
                        <p className="text-sm text-slate-800 font-medium">-</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
            <CardFooter className="bg-white/30 p-6 rounded-b-xl border-t border-white/60 flex justify-end">
              <Button type="submit" size="lg" disabled={isFullyEvaluated} className="w-full sm:w-auto px-10 shadow-sm hover:shadow-md transition-all font-medium rounded-full">
                {isFullyEvaluated ? "Kandidat Selesai Dievaluasi" : "Mulai Evaluasi"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
