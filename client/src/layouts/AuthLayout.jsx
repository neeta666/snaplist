import AuthBrandPanel from './AuthBrandPanel';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen lg:flex">
      <div className="hidden lg:block lg:w-[60%]">
        <AuthBrandPanel />
      </div>

      <div className="flex min-h-screen flex-1 items-start justify-center bg-[#F5F5F7] px-6 py-6 lg:items-center lg:px-12 lg:py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}