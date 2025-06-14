import { PageLayout } from './PageLayout';

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <PageLayout title={title} description={description}>
      <div className="flex h-[60vh] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">{title} is coming soon!</h3>
          <p className="text-muted-foreground text-sm">
            This feature is currently under development.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
