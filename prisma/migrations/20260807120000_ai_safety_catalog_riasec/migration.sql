-- FutuRoute AI güvenilirlik, katalog ve RIASEC veri yapıları.
CREATE TYPE "AiTask" AS ENUM ('SUGGEST_GOALS', 'PLAN_STEPS', 'RANK_CATALOG_ITEMS');
CREATE TYPE "AiSourceMode" AS ENUM ('MODEL', 'TEMPLATE', 'RULE');
CREATE TYPE "AiGenerationStatus" AS ENUM ('SUCCESS', 'FALLBACK', 'REJECTED', 'FAILED');
CREATE TYPE "CatalogItemType" AS ENUM ('MICRO_CREDENTIAL', 'CAREER_PROGRAM', 'COURSE');
CREATE TYPE "CatalogVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

CREATE TABLE "AiGeneration" (
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
  CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiFeedback" (
  "id" TEXT NOT NULL,
  "generationId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "helpful" BOOLEAN NOT NULL,
  "reasonCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiFeedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiRateLimitBucket" (
  "key" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "bucketType" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiRateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "CareerInterestResult" (
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
  CONSTRAINT "CareerInterestResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CatalogItem" (
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

CREATE UNIQUE INDEX "AiGeneration_requestId_key" ON "AiGeneration"("requestId");
CREATE INDEX "AiGeneration_profileId_createdAt_idx" ON "AiGeneration"("profileId", "createdAt");
CREATE INDEX "AiGeneration_task_createdAt_idx" ON "AiGeneration"("task", "createdAt");
CREATE UNIQUE INDEX "AiFeedback_generationId_key" ON "AiFeedback"("generationId");
CREATE INDEX "AiFeedback_profileId_createdAt_idx" ON "AiFeedback"("profileId", "createdAt");
CREATE INDEX "AiRateLimitBucket_profileId_expiresAt_idx" ON "AiRateLimitBucket"("profileId", "expiresAt");
CREATE UNIQUE INDEX "CareerInterestResult_profileId_key" ON "CareerInterestResult"("profileId");
CREATE INDEX "CatalogItem_verificationStatus_isActive_idx" ON "CatalogItem"("verificationStatus", "isActive");
CREATE INDEX "CatalogItem_minGrade_maxGrade_idx" ON "CatalogItem"("minGrade", "maxGrade");

ALTER TABLE "AiGeneration" ADD CONSTRAINT "AiGeneration_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiGeneration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiRateLimitBucket" ADD CONSTRAINT "AiRateLimitBucket_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerInterestResult" ADD CONSTRAINT "CareerInterestResult_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
