import { redirect } from 'next/navigation';

export default function AdminProgramsRedirect() {
  redirect('/admin/dashboard?tab=programs');
}
