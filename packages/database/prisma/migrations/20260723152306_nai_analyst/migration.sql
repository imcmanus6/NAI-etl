-- CreateTable
CREATE TABLE "nai_populations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'dynamic',
    "predicates" JSONB NOT NULL DEFAULT '[]',
    "breakdowns" JSONB NOT NULL DEFAULT '[]',
    "static_ids" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nai_populations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nai_action_requests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "population_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "params" JSONB NOT NULL DEFAULT '{}',
    "preview" JSONB,
    "result" JSONB,
    "lateral_ref" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nai_action_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nai_audit_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "category" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nai_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nai_populations_tenant_id_idx" ON "nai_populations"("tenant_id");

-- CreateIndex
CREATE INDEX "nai_action_requests_tenant_id_idx" ON "nai_action_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "nai_audit_events_tenant_id_idx" ON "nai_audit_events"("tenant_id");

-- CreateIndex
CREATE INDEX "nai_audit_events_tenant_id_category_idx" ON "nai_audit_events"("tenant_id", "category");
