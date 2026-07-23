import { pgTable, serial, text, integer, real, boolean, timestamp, json } from "drizzle-orm/pg-core";

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  candidateName: text("candidate_name").notNull(),
  jenisKelamin: text("jenis_kelamin"),
  posisiLamaran: text("posisi_lamaran"),
  wilayahPendaftaran: text("wilayah_pendaftaran"),
  kampus: text("kampus"),
  prodi: text("prodi"),
  ipk: text("ipk"),
  lamaStudi: text("lama_studi"),
  tautanBerkas: text("tautan_berkas"),
  photoUrl: text("photo_url"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id")
    .references(() => candidates.id)
    .notNull(),
  interviewerName: text("interviewer_name").notNull(),
  totalScore: real("total_score").notNull(),
  category: text("category").notNull(),
  hasRedFlag: boolean("has_red_flag").notNull(),
  aspectResults: json("aspect_results"), // Storing aspect summary snapshot
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewScores = pgTable("interview_scores", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id")
    .references(() => interviews.id)
    .notNull(),
  indicatorId: text("indicator_id").notNull(),
  score: integer("score").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
