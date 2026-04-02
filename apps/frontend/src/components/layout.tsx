import { Navbar } from ".";

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  className?: string;
  noPadding?: boolean;
}

export function Layout({ children, showNavbar = true, className, noPadding = false }: LayoutProps) {
  return (
    <main className={`max-w-md mx-auto md:shadow-lg bg-white min-h-screen flex flex-col ${noPadding ? "" : "px-4 py-6"} ${className}`}>
      {children}
      {showNavbar && <Navbar />}
    </main>
  );
}

export default Layout;
