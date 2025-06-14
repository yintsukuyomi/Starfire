import { PageLayout } from './PageLayout';

export function Dashboard() {
  return (
    <PageLayout 
      title="Welcome to Starfire"
      description="Your personal knowledge and relationship management system"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium">Recent Notes</h3>
          <p className="text-sm text-muted-foreground">View your latest notes and thoughts</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium">Upcoming Tasks</h3>
          <p className="text-sm text-muted-foreground">Check your pending tasks</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium">Reading List</h3>
          <p className="text-sm text-muted-foreground">Continue reading your books</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium">Recent Messages</h3>
          <p className="text-sm text-muted-foreground">View your latest messages</p>
        </div>
      </div>
    </PageLayout>
  );
}
