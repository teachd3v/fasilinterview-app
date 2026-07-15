import { pgTable, serial, text, integer, real, boolean, timestamp, json } from "drizzle-orm/pg-core";

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  interviewerName: text("interviewer_name").notNull(),
  candidateName: text("candidate_name").notNull(),
  ipk: real("ipk").notNull(),
  semester: integer("semester").notNull(),
  potentialSkill: text("potential_skill").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id")
    .references(() => candidates.id)
    .notNull(),
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
