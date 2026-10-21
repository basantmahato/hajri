CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"employee_id" varchar(50) NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date,
	"gender" text,
	"phone_number" varchar(20),
	"address" text,
	"city" text,
	"state" text,
	"postal_code" varchar(20),
	"department" text,
	"position" text NOT NULL,
	"employment_type" text DEFAULT 'full-time' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"joining_date" date NOT NULL,
	"leaving_date" date,
	"salary" numeric(10, 2),
	"salary_type" text DEFAULT 'monthly' NOT NULL,
	"work_days" text,
	"work_hours" varchar(10),
	"manager_id" integer,
	"emergency_contact_name" text,
	"emergency_contact_phone" varchar(20),
	"emergency_contact_relation" text,
	"documents" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"daily_wage" numeric(10, 2),
	"status" text DEFAULT 'active' NOT NULL,
	"permissions" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"invited_by" integer,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" text DEFAULT 'retail' NOT NULL,
	"industry" text,
	"description" text,
	"logo" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" varchar(20),
	"phone" varchar(20),
	"email" text,
	"website" text,
	"owner_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC',
	"settings" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "organization_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;