import { redirect } from 'next/navigation';

export default function StudentCounselingRedirect() {
  redirect('/student/profile?tab=reports');
}
