import { PageLayout } from './PageLayout';

export function Dashboard() {
  return (
    <PageLayout 
      title="Dashboard" 
      description="Welcome to your personal workspace"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Recent Notes</h3>
          <p className="text-muted-foreground">No recent notes</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Tasks</h3>
          <p className="text-muted-foreground">No pending tasks</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Library</h3>
          <p className="text-muted-foreground">No books in library</p>
        </div>
      </div>
    </PageLayout>
  );
}
