ALTER TABLE "ticket" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "seen_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "ticket_user_id_seen_at_idx" ON "ticket" USING btree ("user_id","seen_at");