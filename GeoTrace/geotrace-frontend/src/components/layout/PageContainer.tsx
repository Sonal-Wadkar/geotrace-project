interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {children}
    </main>
  );
}
