import { redirect } from 'next/navigation';

export default function StudentFavoritesRedirect() {
  redirect('/student/programs?tab=favorites');
}
