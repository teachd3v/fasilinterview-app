import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useInterviewStore } from '../store/useInterviewStore'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Briefcase, GraduationCap, User, UserCircle } from 'lucide-react'

const formSchema = z.object({
  interviewerName: z.string().min(2, "Nama Pewawancara wajib diisi"),
  candidateName: z.string().min(2, "Nama Kandidat wajib diisi"),
  ipk: z.coerce.number().min(0, "IPK tidak valid").max(4, "IPK maksimal 4.00"),
  semester: z.coerce.number().min(1, "Semester tidak valid").max(14, "Semester maksimal 14"),
  potentialSkill: z.string().min(1, "Potensi/Skill wajib dipilih")
})

export function OnboardingScreen() {
  const navigate = useNavigate()
  const { setCandidateData } = useInterviewStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewerName: "",
      candidateName: "",
      ipk: 0,
      semester: 1,
      potentialSkill: ""
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setCandidateData(values)
    navigate('/evaluate')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background shapes for glass effect */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <Card className="w-full max-w-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden relative z-10">
        <CardHeader className="bg-white/40 border-b border-white/60 p-8 text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-semibold tracking-wider text-primary/80 uppercase">Etos ID</h2>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Form Wawancara Fasilitator</CardTitle>
          <CardDescription className="text-slate-600">
            Lengkapi data diri Anda dan kandidat sebelum memulai sesi wawancara.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-4 pb-4 px-8 bg-white/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Kiri: Data Pewawancara & Basic Kandidat */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/60 pb-1 mb-2">
                    <UserCircle className="w-4 h-4 text-primary/70" />
                    <h3 className="text-sm font-semibold text-slate-700">Data Pewawancara</h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="interviewerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Nama Lengkap Anda</FormLabel>
                        <FormControl>
                          <Input placeholder="Misal: Budi Santoso" {...field} className="h-8 text-sm bg-white/50 focus:bg-white transition-colors" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2 border-b border-white/60 pb-1 mb-2 mt-4">
                    <User className="w-4 h-4 text-primary/70" />
                    <h3 className="text-sm font-semibold text-slate-700">Identitas Kandidat</h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="candidateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Nama Lengkap Kandidat</FormLabel>
                        <FormControl>
                          <Input placeholder="Misal: Siti Aminah" {...field} className="h-8 text-sm bg-white/50 focus:bg-white transition-colors" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Kanan: Detail Akademik Kandidat */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/60 pb-1 mb-2">
                    <GraduationCap className="w-4 h-4 text-primary/70" />
                    <h3 className="text-sm font-semibold text-slate-700">Detail Akademik</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ipk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">IPK</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="3.50" {...field} className="h-8 text-sm bg-white/50 focus:bg-white transition-colors" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="semester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Semester</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} className="h-8 text-sm bg-white/50 focus:bg-white transition-colors" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="potentialSkill"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Potensi / Skill Utama</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm bg-white/50 focus:bg-white transition-colors">
                                <SelectValue placeholder="Pilih potensi skill" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="leadership">Kepemimpinan</SelectItem>
                              <SelectItem value="public_speaking">Public Speaking</SelectItem>
                              <SelectItem value="academic">Akademik & Riset</SelectItem>
                              <SelectItem value="social_impact">Sosial</SelectItem>
                              <SelectItem value="entrepreneurship">Kewirausahaan</SelectItem>
                              <SelectItem value="technology">Teknologi</SelectItem>
                              <SelectItem value="other">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-white/30 p-4 rounded-b-xl border-t border-white/60 flex justify-end">
              <Button type="submit" size="sm" className="w-full sm:w-auto px-8 shadow-sm hover:shadow-md transition-all font-medium rounded-full">
                Mulai Evaluasi Form (Enter)
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
