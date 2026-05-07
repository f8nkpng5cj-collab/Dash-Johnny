import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';
import LoginForm from './LoginForm';

export default function Page() {
  const session = cookies().get('jdash_session')?.value;
  if (session !== 'ok') return <LoginForm />;
  return <DashboardClient />;
}
