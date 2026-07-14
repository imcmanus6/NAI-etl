-- CreateTable
CREATE TABLE "pipeline_schedules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "cron" TEXT NOT NULL DEFAULT '0 * * * *',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "source_connection_id" TEXT,
    "source_entity" TEXT,
    "destination_connection_id" TEXT,
    "outputMode" TEXT NOT NULL DEFAULT 'api',
    "target_schema_id" TEXT,
    "last_run_at" TIMESTAMP(3),
    "last_run_id" TEXT,
    "last_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_schedules_project_id_key" ON "pipeline_schedules"("project_id");

-- CreateIndex
CREATE INDEX "pipeline_schedules_tenant_id_idx" ON "pipeline_schedules"("tenant_id");

-- CreateIndex
CREATE INDEX "pipeline_schedules_enabled_idx" ON "pipeline_schedules"("enabled");

-- AddForeignKey
ALTER TABLE "pipeline_schedules" ADD CONSTRAINT "pipeline_schedules_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
