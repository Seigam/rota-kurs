-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."EntryType" AS ENUM ('PLAN', 'HEDEF', 'ISTEK', 'GOAL', 'STATUS', 'WISH');

-- CreateEnum
CREATE TYPE "public"."FamilyRelation" AS ENUM ('ANNE', 'BABA', 'KARDES', 'DIGER', 'MOTHER', 'FATHER', 'SIBLING', 'GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."LifeDomain" AS ENUM ('ACTIVITIES', 'FINANCIAL', 'HEALTH', 'HOUSING', 'SOCIAL', 'TRANSPORT', 'CAREER', 'ACADEMIC', 'PERSONAL_DEV', 'SOCIAL_EMOTIONAL', 'HEALTH_LIFESTYLE', 'HOBBIES_LEISURE');

-- CreateEnum
CREATE TYPE "public"."PlanColumn" AS ENUM ('GOAL', 'PLAN', 'STATUS', 'WISH');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."TestStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."CareerProgram" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requiredSkills" TEXT NOT NULL DEFAULT '[]',
    "relatedMbtiTypes" TEXT NOT NULL DEFAULT '[]',
    "relatedEnneagramTypes" TEXT NOT NULL DEFAULT '[]',
    "relatedDomainTags" TEXT NOT NULL DEFAULT '[]',
    "relatedValueTags" TEXT NOT NULL DEFAULT '[]',
    "provider" TEXT,
    "durationInfo" TEXT,
    "costInfo" TEXT,
    "link" TEXT,
    "duration" TEXT,
    "minGrade" INTEGER NOT NULL DEFAULT 9,
    "mbtiFit" TEXT,
    "enneagramFit" TEXT,
    "url" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassGroup" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "section" TEXT NOT NULL,

    CONSTRAINT "ClassGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseApprovalRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "coursePlatform" TEXT NOT NULL DEFAULT 'Rota Kurs Platformu',
    "courseLevel" TEXT,
    "courseDuration" TEXT,
    "courseUrl" TEXT,
    "courseReason" TEXT,
    "domain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "counselorNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DomainPlan" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "columnType" TEXT NOT NULL,
    "contentText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "scheduledDate" TIMESTAMP(3),

    CONSTRAINT "DomainPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FamilyMember" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "relation" "public"."FamilyRelation" NOT NULL,
    "relationType" TEXT DEFAULT 'Aile Üyesi',
    "age" INTEGER,
    "occupation" TEXT,
    "educationLevel" TEXT,
    "closenessScore" INTEGER DEFAULT 3,
    "influenceScore" INTEGER DEFAULT 3,
    "supportLevel" TEXT DEFAULT 'Yüksek',
    "notes" TEXT,
    "note" TEXT,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FavoriteProgram" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "careerProgramId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalPlanItem" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "wishText" TEXT NOT NULL,
    "selectedGoal" TEXT NOT NULL,
    "planSteps" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "xpAwarded" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LifeDomainEntry" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "domain" "public"."LifeDomain" NOT NULL,
    "entryType" "public"."EntryType" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeDomainEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LifeDomainPreference" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "domain" "public"."LifeDomain" NOT NULL,
    "answerData" TEXT NOT NULL,

    CONSTRAINT "LifeDomainPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonalityResult" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT,
    "profileId" TEXT,
    "mbtiType" TEXT NOT NULL,
    "enneagramType" INTEGER NOT NULL DEFAULT 1,
    "enneagramWing" INTEGER,
    "scoreBreakdown" TEXT NOT NULL DEFAULT '{}',
    "mbtiScores" TEXT DEFAULT '{}',
    "enneagramScores" TEXT DEFAULT '{}',
    "dominantEnneagram" TEXT,
    "wingEnneagram" TEXT,
    "fullEnneagramCode" TEXT,
    "summary" TEXT,
    "strengths" TEXT,
    "blindSpots" TEXT,
    "recommendedTrack" TEXT,
    "studyHabits" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalityResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recommendation" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT,
    "profileId" TEXT,
    "careerProgramId" TEXT,
    "programId" TEXT NOT NULL DEFAULT '',
    "matchScore" INTEGER NOT NULL DEFAULT 50,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "matchReason" TEXT,
    "explanation" TEXT DEFAULT '',
    "isFavorite" BOOLEAN DEFAULT false,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RpgChoice" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "choiceText" TEXT NOT NULL,
    "nextSceneId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "mbtiWeights" TEXT NOT NULL DEFAULT '{}',
    "enneagramWeights" TEXT NOT NULL DEFAULT '{}',
    "mbtiEffect" TEXT,
    "enneagramEffect" TEXT,

    CONSTRAINT "RpgChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RpgScenario" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RpgScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RpgScene" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sceneNumber" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "narrativeText" TEXT NOT NULL,
    "sceneType" TEXT NOT NULL DEFAULT 'STORY',
    "bgImage" TEXT,

    CONSTRAINT "RpgScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classGroupId" TEXT,
    "birthYear" INTEGER,
    "grade" INTEGER,
    "targetCareer" TEXT,
    "hobbies" TEXT,
    "favoriteSubjects" TEXT,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "completedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "schoolName" TEXT,
    "dailyXp" INTEGER NOT NULL DEFAULT 0,
    "dailyXpDate" TIMESTAMP(3),
    "lastLessonDate" TIMESTAMP(3),
    "streakDays" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentValueRanking" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "profileId" TEXT,
    "valueItemId" TEXT,
    "valueName" TEXT NOT NULL DEFAULT '',
    "rankOrder" INTEGER NOT NULL DEFAULT 1,
    "rank" INTEGER DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentValueRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherNote" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "noteText" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TestAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT,
    "sceneId" TEXT NOT NULL,
    "choiceId" TEXT,
    "studentId" TEXT,
    "userId" TEXT,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chosenAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TestAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "public"."TestStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentSceneId" TEXT,

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ValueItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "ValueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_TeacherClasses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TeacherClasses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroup_schoolId_grade_section_key" ON "public"."ClassGroup"("schoolId" ASC, "grade" ASC, "section" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteProgram_studentId_careerProgramId_key" ON "public"."FavoriteProgram"("studentId" ASC, "careerProgramId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "LifeDomainEntry_studentId_domain_entryType_key" ON "public"."LifeDomainEntry"("studentId" ASC, "domain" ASC, "entryType" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalityResult_attemptId_key" ON "public"."PersonalityResult"("attemptId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalityResult_profileId_key" ON "public"."PersonalityResult"("profileId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_attemptId_careerProgramId_key" ON "public"."Recommendation"("attemptId" ASC, "careerProgramId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_profileId_programId_key" ON "public"."Recommendation"("profileId" ASC, "programId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "RpgScene_scenarioId_order_key" ON "public"."RpgScene"("scenarioId" ASC, "order" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "public"."StudentProfile"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "public"."TeacherProfile"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TestAnswer_attemptId_sceneId_key" ON "public"."TestAnswer"("attemptId" ASC, "sceneId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE INDEX "_TeacherClasses_B_index" ON "public"."_TeacherClasses"("B" ASC);

-- AddForeignKey
ALTER TABLE "public"."ClassGroup" ADD CONSTRAINT "ClassGroup_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseApprovalRequest" ADD CONSTRAINT "CourseApprovalRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DomainPlan" ADD CONSTRAINT "DomainPlan_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FamilyMember" ADD CONSTRAINT "FamilyMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteProgram" ADD CONSTRAINT "FavoriteProgram_careerProgramId_fkey" FOREIGN KEY ("careerProgramId") REFERENCES "public"."CareerProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteProgram" ADD CONSTRAINT "FavoriteProgram_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalPlanItem" ADD CONSTRAINT "GoalPlanItem_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LifeDomainEntry" ADD CONSTRAINT "LifeDomainEntry_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LifeDomainPreference" ADD CONSTRAINT "LifeDomainPreference_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalityResult" ADD CONSTRAINT "PersonalityResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalityResult" ADD CONSTRAINT "PersonalityResult_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recommendation" ADD CONSTRAINT "Recommendation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recommendation" ADD CONSTRAINT "Recommendation_careerProgramId_fkey" FOREIGN KEY ("careerProgramId") REFERENCES "public"."CareerProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recommendation" ADD CONSTRAINT "Recommendation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Recommendation" ADD CONSTRAINT "Recommendation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."CareerProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RpgChoice" ADD CONSTRAINT "RpgChoice_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "public"."RpgScene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RpgScene" ADD CONSTRAINT "RpgScene_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "public"."RpgScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "public"."ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentValueRanking" ADD CONSTRAINT "StudentValueRanking_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentValueRanking" ADD CONSTRAINT "StudentValueRanking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentValueRanking" ADD CONSTRAINT "StudentValueRanking_valueItemId_fkey" FOREIGN KEY ("valueItemId") REFERENCES "public"."ValueItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherNote" ADD CONSTRAINT "TeacherNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherNote" ADD CONSTRAINT "TeacherNote_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestAnswer" ADD CONSTRAINT "TestAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestAnswer" ADD CONSTRAINT "TestAnswer_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "public"."RpgChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestAnswer" ADD CONSTRAINT "TestAnswer_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "public"."RpgScene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestAnswer" ADD CONSTRAINT "TestAnswer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestAttempt" ADD CONSTRAINT "TestAttempt_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "public"."RpgScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestAttempt" ADD CONSTRAINT "TestAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TeacherClasses" ADD CONSTRAINT "_TeacherClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TeacherClasses" ADD CONSTRAINT "_TeacherClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
