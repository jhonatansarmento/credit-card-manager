import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const HomePage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  return (
    <>
      <main className='flex items-center justify-center flex-col h-dvh'>
        <UserButton showName />
      </main>
    </>
  );
};

export default HomePage;
