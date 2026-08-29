import type { Metadata } from 'next';
import Image from 'next/image';
import AdminLoginForm from './AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Sign In',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/images/logo-spiral-purple.png"
            alt="The Purple Wheel"
            width={56}
            height={56}
            className="mx-auto mb-4 rounded-full"
          />
          <h1 className="font-heading text-2xl text-purple-deep">Admin sign in</h1>
          <p className="text-sm text-ink/50 mt-1">The Purple Wheel</p>
        </div>
        <div className="bg-white rounded-2xl border border-lilac p-8">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
