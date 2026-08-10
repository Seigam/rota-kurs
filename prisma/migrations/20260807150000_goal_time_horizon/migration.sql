-- Öğrencinin AI hedefi için seçtiği planlama vadesi.
CREATE TYPE "GoalTimeHorizon" AS ENUM ('SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM');

ALTER TABLE "GoalPlanItem" ADD COLUMN "timeHorizon" "GoalTimeHorizon";
