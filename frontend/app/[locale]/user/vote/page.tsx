import { getDictionary } from '@/lib/i18n';
import { Locale } from '@/i18n.config';
import UserVoteClient from '@/components/user/vote/UserVoteClient';

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <UserVoteClient dict={dict} />;
}
