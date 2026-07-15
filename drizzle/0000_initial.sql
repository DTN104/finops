CREATE SCHEMA IF NOT EXISTS "finops";
--> statement-breakpoint
CREATE TYPE "finops"."account_status" AS ENUM('active', 'suspended', 'closed');--> statement-breakpoint
CREATE TYPE "finops"."audit_outcome" AS ENUM('success', 'denied');--> statement-breakpoint
CREATE TYPE "finops"."cash_ledger_type" AS ENUM('deposit', 'withdrawal', 'order_reserve', 'order_release', 'trade_debit', 'trade_credit', 'fee', 'dividend', 'adjustment');--> statement-breakpoint
CREATE TYPE "finops"."corporate_action_status" AS ENUM('draft', 'announced', 'upcoming', 'completed');--> statement-breakpoint
CREATE TYPE "finops"."corporate_action_type" AS ENUM('cash_dividend', 'stock_dividend', 'bonus_shares', 'rights_offering', 'voting', 'bond_maturity');--> statement-breakpoint
CREATE TYPE "finops"."instrument_status" AS ENUM('trading', 'halted');--> statement-breakpoint
CREATE TYPE "finops"."order_side" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "finops"."order_status" AS ENUM('pending', 'open', 'partial', 'filled', 'cancelled', 'rejected');--> statement-breakpoint
CREATE TYPE "finops"."order_type" AS ENUM('limit', 'stop');--> statement-breakpoint
CREATE TYPE "finops"."response_status" AS ENUM('pending', 'submitted', 'withdrawn');--> statement-breakpoint
CREATE TYPE "finops"."table_density" AS ENUM('comfortable', 'compact');--> statement-breakpoint
CREATE TYPE "finops"."theme" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
CREATE TYPE "finops"."user_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TABLE "finops"."trading_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_number" varchar(40) NOT NULL,
	"name" varchar(120) NOT NULL,
	"currency" varchar(3) DEFAULT 'VND' NOT NULL,
	"status" "finops"."account_status" DEFAULT 'active' NOT NULL,
	"cash_balance" bigint DEFAULT 0 NOT NULL,
	"buying_power" bigint DEFAULT 0 NOT NULL,
	"realized_pnl" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trading_accounts_cash_nonnegative" CHECK ("finops"."trading_accounts"."cash_balance" >= 0),
	CONSTRAINT "trading_accounts_buying_power_nonnegative" CHECK ("finops"."trading_accounts"."buying_power" >= 0)
);
--> statement-breakpoint
CREATE TABLE "finops"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"account_id" uuid,
	"action" varchar(80) NOT NULL,
	"module" varchar(80) NOT NULL,
	"resource_type" varchar(80) NOT NULL,
	"resource_id" varchar(120) NOT NULL,
	"outcome" "finops"."audit_outcome" NOT NULL,
	"origin" varchar(160) NOT NULL,
	"summary" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finops"."corporate_action_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corporate_action_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"response_type" varchar(60) NOT NULL,
	"status" "finops"."response_status" DEFAULT 'pending' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finops"."corporate_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(60) NOT NULL,
	"instrument_symbol" varchar(20) NOT NULL,
	"type" "finops"."corporate_action_type" NOT NULL,
	"status" "finops"."corporate_action_status" DEFAULT 'draft' NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text NOT NULL,
	"ex_date" date NOT NULL,
	"record_date" date NOT NULL,
	"payment_date" date NOT NULL,
	"currency" varchar(3) DEFAULT 'VND' NOT NULL,
	"cash_amount" bigint,
	"ratio_numerator" integer,
	"ratio_denominator" integer,
	"tax_rate_bps" integer DEFAULT 0 NOT NULL,
	"requires_response" boolean DEFAULT false NOT NULL,
	"source" varchar(160) NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"published_by_user_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "corporate_actions_date_order" CHECK ("finops"."corporate_actions"."ex_date" <= "finops"."corporate_actions"."record_date" AND "finops"."corporate_actions"."record_date" <= "finops"."corporate_actions"."payment_date"),
	CONSTRAINT "corporate_actions_tax_rate_range" CHECK ("finops"."corporate_actions"."tax_rate_bps" >= 0 AND "finops"."corporate_actions"."tax_rate_bps" <= 10000)
);
--> statement-breakpoint
CREATE TABLE "finops"."roles" (
	"code" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finops"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(120) NOT NULL,
	"initials" varchar(8) NOT NULL,
	"role_code" varchar(20) NOT NULL,
	"status" "finops"."user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finops"."instruments" (
	"symbol" varchar(20) PRIMARY KEY NOT NULL,
	"company" varchar(160) NOT NULL,
	"exchange" varchar(20) DEFAULT 'HOSE' NOT NULL,
	"sector" varchar(80) NOT NULL,
	"currency" varchar(3) DEFAULT 'VND' NOT NULL,
	"reference_price" bigint NOT NULL,
	"previous_close" bigint NOT NULL,
	"status" "finops"."instrument_status" DEFAULT 'trading' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finops"."cash_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"order_id" uuid,
	"execution_id" uuid,
	"type" "finops"."cash_ledger_type" NOT NULL,
	"amount" bigint NOT NULL,
	"balance_after" bigint NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cash_ledger_balance_nonnegative" CHECK ("finops"."cash_ledger"."balance_after" >= 0),
	CONSTRAINT "cash_ledger_amount_nonzero" CHECK ("finops"."cash_ledger"."amount" <> 0)
);
--> statement-breakpoint
CREATE TABLE "finops"."positions" (
	"account_id" uuid NOT NULL,
	"instrument_symbol" varchar(20) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"average_cost" bigint DEFAULT 0 NOT NULL,
	"realized_pnl" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "positions_pk" PRIMARY KEY("account_id","instrument_symbol"),
	CONSTRAINT "positions_quantity_nonnegative" CHECK ("finops"."positions"."quantity" >= 0),
	CONSTRAINT "positions_average_cost_nonnegative" CHECK ("finops"."positions"."average_cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "finops"."user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"theme" "finops"."theme" DEFAULT 'dark' NOT NULL,
	"table_density" "finops"."table_density" DEFAULT 'comfortable' NOT NULL,
	"quote_cadence_ms" integer DEFAULT 500 NOT NULL,
	"performance_telemetry" boolean DEFAULT true NOT NULL,
	"timezone" varchar(80) DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finops"."executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"instrument_symbol" varchar(20) NOT NULL,
	"quantity" integer NOT NULL,
	"price" bigint NOT NULL,
	"fee" bigint DEFAULT 0 NOT NULL,
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "executions_quantity_positive" CHECK ("finops"."executions"."quantity" > 0),
	CONSTRAINT "executions_price_positive" CHECK ("finops"."executions"."price" > 0),
	CONSTRAINT "executions_fee_nonnegative" CHECK ("finops"."executions"."fee" >= 0)
);
--> statement-breakpoint
CREATE TABLE "finops"."orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" varchar(50) NOT NULL,
	"account_id" uuid NOT NULL,
	"instrument_symbol" varchar(20) NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"side" "finops"."order_side" NOT NULL,
	"order_type" "finops"."order_type" DEFAULT 'limit' NOT NULL,
	"status" "finops"."order_status" DEFAULT 'pending' NOT NULL,
	"quantity" integer NOT NULL,
	"limit_price" bigint NOT NULL,
	"filled_quantity" integer DEFAULT 0 NOT NULL,
	"reserved_amount" bigint DEFAULT 0 NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_quantity_positive" CHECK ("finops"."orders"."quantity" > 0),
	CONSTRAINT "orders_price_positive" CHECK ("finops"."orders"."limit_price" > 0),
	CONSTRAINT "orders_fill_range" CHECK ("finops"."orders"."filled_quantity" >= 0 AND "finops"."orders"."filled_quantity" <= "finops"."orders"."quantity"),
	CONSTRAINT "orders_reserved_nonnegative" CHECK ("finops"."orders"."reserved_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "finops"."trading_accounts" ADD CONSTRAINT "trading_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "finops"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "finops"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."audit_logs" ADD CONSTRAINT "audit_logs_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finops"."trading_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."corporate_action_responses" ADD CONSTRAINT "corporate_action_responses_corporate_action_id_corporate_actions_id_fk" FOREIGN KEY ("corporate_action_id") REFERENCES "finops"."corporate_actions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."corporate_action_responses" ADD CONSTRAINT "corporate_action_responses_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finops"."trading_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."corporate_action_responses" ADD CONSTRAINT "corporate_action_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "finops"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."corporate_actions" ADD CONSTRAINT "corporate_actions_instrument_symbol_instruments_symbol_fk" FOREIGN KEY ("instrument_symbol") REFERENCES "finops"."instruments"("symbol") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "finops"."corporate_actions" ADD CONSTRAINT "corporate_actions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "finops"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."corporate_actions" ADD CONSTRAINT "corporate_actions_published_by_user_id_users_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "finops"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."users" ADD CONSTRAINT "users_role_code_roles_code_fk" FOREIGN KEY ("role_code") REFERENCES "finops"."roles"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "finops"."cash_ledger" ADD CONSTRAINT "cash_ledger_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finops"."trading_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."cash_ledger" ADD CONSTRAINT "cash_ledger_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "finops"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."cash_ledger" ADD CONSTRAINT "cash_ledger_execution_id_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "finops"."executions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."positions" ADD CONSTRAINT "positions_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finops"."trading_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."positions" ADD CONSTRAINT "positions_instrument_symbol_instruments_symbol_fk" FOREIGN KEY ("instrument_symbol") REFERENCES "finops"."instruments"("symbol") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "finops"."user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "finops"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."executions" ADD CONSTRAINT "executions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "finops"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."executions" ADD CONSTRAINT "executions_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finops"."trading_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."executions" ADD CONSTRAINT "executions_instrument_symbol_instruments_symbol_fk" FOREIGN KEY ("instrument_symbol") REFERENCES "finops"."instruments"("symbol") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "finops"."orders" ADD CONSTRAINT "orders_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "finops"."trading_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finops"."orders" ADD CONSTRAINT "orders_instrument_symbol_instruments_symbol_fk" FOREIGN KEY ("instrument_symbol") REFERENCES "finops"."instruments"("symbol") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "finops"."orders" ADD CONSTRAINT "orders_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "finops"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "trading_accounts_number_uidx" ON "finops"."trading_accounts" USING btree ("account_number");--> statement-breakpoint
CREATE INDEX "trading_accounts_user_idx" ON "finops"."trading_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "finops"."audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_created_idx" ON "finops"."audit_logs" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_created_idx" ON "finops"."audit_logs" USING btree ("resource_type","resource_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_action_outcome_idx" ON "finops"."audit_logs" USING btree ("action","outcome");--> statement-breakpoint
CREATE UNIQUE INDEX "corporate_action_responses_action_account_uidx" ON "finops"."corporate_action_responses" USING btree ("corporate_action_id","account_id");--> statement-breakpoint
CREATE INDEX "corporate_action_responses_user_idx" ON "finops"."corporate_action_responses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "corporate_actions_reference_uidx" ON "finops"."corporate_actions" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "corporate_actions_status_ex_date_idx" ON "finops"."corporate_actions" USING btree ("status","ex_date");--> statement-breakpoint
CREATE INDEX "corporate_actions_instrument_record_date_idx" ON "finops"."corporate_actions" USING btree ("instrument_symbol","record_date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uidx" ON "finops"."users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_status_idx" ON "finops"."users" USING btree ("role_code","status");--> statement-breakpoint
CREATE INDEX "instruments_exchange_status_idx" ON "finops"."instruments" USING btree ("exchange","status");--> statement-breakpoint
CREATE INDEX "instruments_sector_idx" ON "finops"."instruments" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "cash_ledger_account_time_idx" ON "finops"."cash_ledger" USING btree ("account_id","created_at");--> statement-breakpoint
CREATE INDEX "cash_ledger_order_idx" ON "finops"."cash_ledger" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "positions_instrument_idx" ON "finops"."positions" USING btree ("instrument_symbol");--> statement-breakpoint
CREATE INDEX "executions_order_time_idx" ON "finops"."executions" USING btree ("order_id","executed_at");--> statement-breakpoint
CREATE INDEX "executions_account_time_idx" ON "finops"."executions" USING btree ("account_id","executed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_public_id_uidx" ON "finops"."orders" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "orders_account_submitted_idx" ON "finops"."orders" USING btree ("account_id","submitted_at");--> statement-breakpoint
CREATE INDEX "orders_status_submitted_idx" ON "finops"."orders" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "orders_instrument_submitted_idx" ON "finops"."orders" USING btree ("instrument_symbol","submitted_at");
