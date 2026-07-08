-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ClassGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    CONSTRAINT "ClassGroup_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "classGroupId" TEXT,
    "birthYear" INTEGER,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentProfile_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RpgScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RpgScene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "narrativeText" TEXT NOT NULL,
    "sceneType" TEXT NOT NULL DEFAULT 'STORY',
    "bgImage" TEXT,
    CONSTRAINT "RpgScene_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RpgScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RpgChoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sceneId" TEXT NOT NULL,
    "choiceText" TEXT NOT NULL,
    "nextSceneId" TEXT,
    "mbtiWeights" TEXT NOT NULL DEFAULT '{}',
    "enneagramWeights" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "RpgChoice_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "RpgScene" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "currentSceneId" TEXT,
    CONSTRAINT "TestAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestAttempt_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RpgScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "choiceId" TEXT NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestAnswer_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "RpgScene" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestAnswer_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "RpgChoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonalityResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "mbtiType" TEXT NOT NULL,
    "enneagramType" INTEGER NOT NULL,
    "enneagramWing" INTEGER,
    "scoreBreakdown" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonalityResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "age" INTEGER,
    "occupation" TEXT,
    "note" TEXT,
    CONSTRAINT "FamilyMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LifeDomainPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "answerData" TEXT NOT NULL,
    CONSTRAINT "LifeDomainPreference_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LifeDomainEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LifeDomainEntry_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ValueItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "StudentValueRanking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "valueItemId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentValueRanking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentValueRanking_valueItemId_fkey" FOREIGN KEY ("valueItemId") REFERENCES "ValueItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CareerProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "careerProgramId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "matchReason" TEXT,
    CONSTRAINT "Recommendation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recommendation_careerProgramId_fkey" FOREIGN KEY ("careerProgramId") REFERENCES "CareerProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FavoriteProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "careerProgramId" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FavoriteProgram_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FavoriteProgram_careerProgramId_fkey" FOREIGN KEY ("careerProgramId") REFERENCES "CareerProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeacherNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeacherNote_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeacherNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TeacherClasses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TeacherClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TeacherClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "TeacherProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroup_schoolId_grade_section_key" ON "ClassGroup"("schoolId", "grade", "section");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RpgScene_scenarioId_order_key" ON "RpgScene"("scenarioId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TestAnswer_attemptId_sceneId_key" ON "TestAnswer"("attemptId", "sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalityResult_attemptId_key" ON "PersonalityResult"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "LifeDomainEntry_studentId_domain_entryType_key" ON "LifeDomainEntry"("studentId", "domain", "entryType");

-- CreateIndex
CREATE UNIQUE INDEX "StudentValueRanking_studentId_valueItemId_key" ON "StudentValueRanking"("studentId", "valueItemId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentValueRanking_studentId_rank_key" ON "StudentValueRanking"("studentId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_attemptId_careerProgramId_key" ON "Recommendation"("attemptId", "careerProgramId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteProgram_studentId_careerProgramId_key" ON "FavoriteProgram"("studentId", "careerProgramId");

-- CreateIndex
CREATE UNIQUE INDEX "_TeacherClasses_AB_unique" ON "_TeacherClasses"("A", "B");

-- CreateIndex
CREATE INDEX "_TeacherClasses_B_index" ON "_TeacherClasses"("B");
