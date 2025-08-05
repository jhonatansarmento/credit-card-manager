import { SignInButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const LoginPage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect('/');
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <div className='text-center space-y-6'>
        <h1 className='text-2xl font-bold '>You are not logged in</h1>
        <div className='flex gap-1'>
          <SignInButton>
            <button className='border bg-amber-50 text-zinc-900 border-green-800 rounded-lg px-5 py-1 bg-green-500hover:bg-green-600 transition-colors'>
              Google
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
