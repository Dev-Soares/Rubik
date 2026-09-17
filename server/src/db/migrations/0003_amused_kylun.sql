CREATE TABLE "user_screen_override" (
	"user_id" text NOT NULL,
	"screen" text NOT NULL,
	"allowed" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_screen_override_user_id_screen_pk" PRIMARY KEY("user_id","screen")
);
--> statement-breakpoint
ALTER TABLE "user_screen_override" ADD CONSTRAINT "user_screen_override_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_screen_override_user_id_idx" ON "user_screen_override" USING btree ("user_id");