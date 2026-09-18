ALTER TABLE "ticket" ADD COLUMN "status" text DEFAULT 'aberto' NOT NULL;--> statement-breakpoint
CREATE INDEX "ticket_status_created_at_idx" ON "ticket" USING btree ("status","created_at");