-- CreateTable
CREATE TABLE "nai_reports" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spec" JSONB NOT NULL DEFAULT '{}',
    "cron" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_run_at" TIMESTAMP(3),
    "last_status" TEXT,
    "last_rows" INTEGER,
    "last_output_key" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nai_reports_tenant_id_idx" ON "nai_reports"("tenant_id");
