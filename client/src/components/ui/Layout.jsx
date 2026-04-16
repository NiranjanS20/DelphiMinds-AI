import { cn } from '../../utils/helpers';

export function PageContainer({ className, children, ...props }) {
  return (
    <div
      className={cn('min-h-screen bg-background flex flex-col', className)}
      {...props}
    >
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export function SectionWrapper({ className, children, ...props }) {
  return (
    <section className={cn('py-8 md:py-12 w-full', className)} {...props}>
      {children}
    </section>
  );
}
