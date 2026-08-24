-- Repair schema objects that were recorded as migrated but are absent from the database.
-- Every operation is conditional so clean databases, where earlier migrations ran
-- normally, can also apply this repair migration safely.
DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GoalTimeHorizon') THEN
    CREATE TYPE "GoalTimeHorizon" AS ENUM ('SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AiTask') THEN
    CREATE TYPE "AiTask" AS ENUM ('SUGGEST_GOALS', 'PLAN_STEPS', 'RANK_CATALOG_ITEMS');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AiSourceMode') THEN
    CREATE TYPE "AiSourceMode" AS ENUM ('MODEL', 'TEMPLATE', 'RULE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AiGenerationStatus') THEN
    CREATE TYPE "AiGenerationStatus" AS ENUM ('SUCCESS', 'FALLBACK', 'REJECTED', 'FAILED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CatalogItemType') THEN
    CREATE TYPE "CatalogItemType" AS ENUM ('MICRO_CREDENTIAL', 'CAREER_PROGRAM', 'COURSE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CatalogVerificationStatus') THEN
    CREATE TYPE "CatalogVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
  END IF;
END
$migration$;

ALTER TABLE "GoalPlanItem" ADD COLUMN IF NOT EXISTS "timeHorizon" "GoalTimeHorizon";

CREATE TABLE IF NOT EXISTS "AiGeneration" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "task" "AiTask" NOT NULL,
  "model" TEXT NOT NULL,
  "promptVersion" TEXT NOT NULL,
  "schemaVersion" TEXT NOT NULL,
  "sourceMode" "AiSourceMode" NOT NULL,
  "status" "AiGenerationStatus" NOT NULL,
  "latencyMs" INTEGER NOT NULL,
  "inputHash" TEXT NOT NULL,
  "promptTokens" INTEGER,
  "completionTokens" INTEGER,
  "fallbackReason" TEXT,
  "safetyCategory" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AiGeneration_profileId_fkey" FOREIGN KEY ("profileId")
    REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AiFeedback" (
  "id" TEXT NOT NULL,
  "generationId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "helpful" BOOLEAN NOT NULL,
  "reasonCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiFeedback_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AiFeedback_generationId_fkey" FOREIGN KEY ("generationId")
    REFERENCES "AiGeneration"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AiFeedback_profileId_fkey" FOREIGN KEY ("profileId")
    REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AiRateLimitBucket" (
  "key" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "bucketType" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiRateLimitBucket_pkey" PRIMARY KEY ("key"),
  CONSTRAINT "AiRateLimitBucket_profileId_fkey" FOREIGN KEY ("profileId")
    REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CareerInterestResult" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "realistic" INTEGER NOT NULL,
  "investigative" INTEGER NOT NULL,
  "artistic" INTEGER NOT NULL,
  "social" INTEGER NOT NULL,
  "enterprising" INTEGER NOT NULL,
  "conventional" INTEGER NOT NULL,
  "topCodes" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CareerInterestResult_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CareerInterestResult_profileId_fkey" FOREIGN KEY ("profileId")
    REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CatalogItem" (
  "id" TEXT NOT NULL,
  "type" "CatalogItemType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "url" TEXT,
  "level" TEXT,
  "duration" TEXT,
  "minGrade" INTEGER NOT NULL DEFAULT 9,
  "maxGrade" INTEGER NOT NULL DEFAULT 12,
  "domainTags" TEXT NOT NULL DEFAULT '[]',
  "skillTags" TEXT NOT NULL DEFAULT '[]',
  "riasecTags" TEXT NOT NULL DEFAULT '[]',
  "verificationStatus" "CatalogVerificationStatus" NOT NULL DEFAULT 'PENDING',
  "verifiedAt" TIMESTAMP(3),
  "verifiedBy" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AiGeneration_requestId_key" ON "AiGeneration"("requestId");
CREATE INDEX IF NOT EXISTS "AiGeneration_profileId_createdAt_idx" ON "AiGeneration"("profileId", "createdAt");
CREATE INDEX IF NOT EXISTS "AiGeneration_task_createdAt_idx" ON "AiGeneration"("task", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "AiFeedback_generationId_key" ON "AiFeedback"("generationId");
CREATE INDEX IF NOT EXISTS "AiFeedback_profileId_createdAt_idx" ON "AiFeedback"("profileId", "createdAt");
CREATE INDEX IF NOT EXISTS "AiRateLimitBucket_profileId_expiresAt_idx" ON "AiRateLimitBucket"("profileId", "expiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "CareerInterestResult_profileId_key" ON "CareerInterestResult"("profileId");
CREATE INDEX IF NOT EXISTS "CatalogItem_verificationStatus_isActive_idx" ON "CatalogItem"("verificationStatus", "isActive");
CREATE INDEX IF NOT EXISTS "CatalogItem_minGrade_maxGrade_idx" ON "CatalogItem"("minGrade", "maxGrade");
