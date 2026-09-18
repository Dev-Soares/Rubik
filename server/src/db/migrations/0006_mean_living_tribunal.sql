CREATE TABLE "ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_name" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_photo" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_photo" ADD CONSTRAINT "ticket_photo_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ticket_created_at_idx" ON "ticket" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ticket_user_id_idx" ON "ticket" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_photo_ticket_id_idx" ON "ticket_photo" USING btree ("ticket_id");