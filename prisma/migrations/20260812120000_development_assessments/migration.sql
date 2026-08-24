-- Additive, forward-only schema expansion for the development pulse feature.
CREATE TYPE "DevelopmentArea" AS ENUM ('LEARNING_FUTURE', 'SELF_DEVELOPMENT_WELLBEING', 'RELATIONSHIPS_PARTICIPATION');
CREATE TYPE "DevelopmentAssessmentKind" AS ENUM ('BASELINE', 'MONTHLY');
CREATE TYPE "DevelopmentAssessmentStatus" AS ENUM ('DRAFT', 'COMPLETED');
CREATE TYPE "DevelopmentConfidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "CatalogFitBand" AS ENUM ('STRONG', 'SUITABLE', 'EXPLORE');

CREATE TABLE "DevelopmentAssessment" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "kind" "DevelopmentAssessmentKind" NOT NULL,
  "status" "DevelopmentAssessmentStatus" NOT NULL DEFAULT 'DRAFT',
  "periodKey" TEXT NOT NULL,
  "questionnaireVersion" TEXT NOT NULL DEFAULT 'development-pulse-v1',
  "scoringVersion" TEXT NOT NULL DEFAULT 'development-priority-v1',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DevelopmentAssessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DevelopmentAssessmentResponse" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "questionKey" TEXT NOT NULL,
  "area" "DevelopmentArea" NOT NULL,
  "domain" "LifeDomain" NOT NULL,
  "statusScore" INTEGER,
  "importanceScore" INTEGER,
  "uncertain" BOOLEAN NOT NULL DEFAULT false,
  "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DevelopmentAssessmentResponse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DevelopmentAreaScore" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "area" "DevelopmentArea" NOT NULL,
  "statusAverage" DOUBLE PRECISION NOT NULL,
  "importanceAverage" DOUBLE PRECISION NOT NULL,
  "priorityScore" INTEGER NOT NULL,
  "confidence" "DevelopmentConfidence" NOT NULL,
  "rank" INTEGER NOT NULL,
  "dominantDomain" "LifeDomain" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DevelopmentAreaScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DevelopmentCatalogRecommendation" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "catalogItemId" TEXT NOT NULL,
  "internalScore" INTEGER NOT NULL,
  "fitBand" "CatalogFitBand" NOT NULL,
  "confidence" "DevelopmentConfidence" NOT NULL,
  "reasonBreakdown" TEXT NOT NULL DEFAULT '[]',
  "rank" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DevelopmentCatalogRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssessmentComment" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssessmentComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CatalogFavorite" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "catalogItemId" TEXT NOT NULL,
  "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CatalogFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DevelopmentAssessment_profileId_kind_periodKey_key" ON "DevelopmentAssessment"("profileId", "kind", "periodKey");
CREATE INDEX "DevelopmentAssessment_profileId_status_completedAt_idx" ON "DevelopmentAssessment"("profileId", "status", "completedAt");
CREATE UNIQUE INDEX "DevelopmentAssessmentResponse_assessmentId_questionKey_key" ON "DevelopmentAssessmentResponse"("assessmentId", "questionKey");
CREATE INDEX "DevelopmentAssessmentResponse_assessmentId_area_idx" ON "DevelopmentAssessmentResponse"("assessmentId", "area");
CREATE UNIQUE INDEX "DevelopmentAreaScore_assessmentId_area_key" ON "DevelopmentAreaScore"("assessmentId", "area");
CREATE INDEX "DevelopmentAreaScore_assessmentId_rank_idx" ON "DevelopmentAreaScore"("assessmentId", "rank");
CREATE UNIQUE INDEX "DevelopmentCatalogRecommendation_assessmentId_catalogItemId_key" ON "DevelopmentCatalogRecommendation"("assessmentId", "catalogItemId");
CREATE INDEX "DevelopmentCatalogRecommendation_assessmentId_rank_idx" ON "DevelopmentCatalogRecommendation"("assessmentId", "rank");
CREATE INDEX "AssessmentComment_assessmentId_createdAt_idx" ON "AssessmentComment"("assessmentId", "createdAt");
CREATE UNIQUE INDEX "CatalogFavorite_profileId_catalogItemId_key" ON "CatalogFavorite"("profileId", "catalogItemId");
CREATE INDEX "CatalogFavorite_profileId_savedAt_idx" ON "CatalogFavorite"("profileId", "savedAt");

ALTER TABLE "DevelopmentAssessment" ADD CONSTRAINT "DevelopmentAssessment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DevelopmentAssessmentResponse" ADD CONSTRAINT "DevelopmentAssessmentResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "DevelopmentAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DevelopmentAreaScore" ADD CONSTRAINT "DevelopmentAreaScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "DevelopmentAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DevelopmentCatalogRecommendation" ADD CONSTRAINT "DevelopmentCatalogRecommendation_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "DevelopmentAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DevelopmentCatalogRecommendation" ADD CONSTRAINT "DevelopmentCatalogRecommendation_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentComment" ADD CONSTRAINT "AssessmentComment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "DevelopmentAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentComment" ADD CONSTRAINT "AssessmentComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogFavorite" ADD CONSTRAINT "CatalogFavorite_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogFavorite" ADD CONSTRAINT "CatalogFavorite_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
