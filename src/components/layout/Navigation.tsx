import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Library, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';

const navItems = [
	{ name: 'Dashboard', path: '/', icon: Home },
	{ name: 'Notebooks', path: '/notebooks', icon: BookOpen },
	{ name: 'Library', path: '/library', icon: Library },
	{ name: 'Messages', path: '/messages', icon: MessageCircle },
];

const morePages = [
	{ name: 'Time Capsule', path: '/time-capsule' },
	{ name: 'Memory Tree', path: '/memory-tree' },
	{ name: 'Playlist', path: '/playlist' },
	{ name: 'Spotify Callback', path: '/spotify-callback' },
];

export function Navigation() {
	const { pathname } = useLocation();
	const [moreOpen, setMoreOpen] = useState(false);

	return (
		<>
			<nav className="ios-tab-bar ios-blur">
				<div className="flex justify-around items-center h-20 px-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const active =
							pathname === item.path ||
							(item.path === '/' && pathname === '/dashboard');
						return (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									'flex flex-col items-center justify-center flex-1 h-full text-ios-caption1 font-medium transition-all duration-200 relative rounded-ios-lg mx-1 py-2',
									active
										? 'text-ios-blue'
										: 'text-ios-gray hover:text-foreground'
								)}
								aria-label={item.name}
							>
								<div
									className={cn(
										'flex flex-col items-center justify-center transition-all duration-200',
										active && 'transform scale-110'
									)}
								>
									<Icon
										className={cn(
											'w-6 h-6 mb-1 transition-all duration-200',
											active && 'text-ios-blue'
										)}
									/>
									<span
										className={cn(
											'text-xs font-medium transition-all duration-200',
											active ? 'text-ios-blue opacity-100' : 'opacity-70'
										)}
									>
										{item.name}
									</span>
								</div>
								{active && (
									<div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-ios-blue rounded-full" />
								)}
							</Link>
						);
					})}

					<button
						onClick={() => setMoreOpen(true)}
						className={cn(
							'flex flex-col items-center justify-center flex-1 h-full text-ios-caption1 font-medium transition-all duration-200 text-ios-gray hover:text-foreground rounded-ios-lg mx-1 py-2'
						)}
						aria-label="More"
					>
						<div className="flex flex-col items-center justify-center">
							<MoreHorizontal className="w-6 h-6 mb-1 transition-all duration-200" />
							<span className="text-xs font-medium opacity-70">More</span>
						</div>
					</button>
				</div>
			</nav>
			{/* More Modal */}
			{moreOpen && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
					<div className="w-full max-w-md bg-background rounded-t-2xl p-6 shadow-lg">
						<h2 className="text-lg font-bold mb-4 text-center">Other Pages</h2>
						<ul className="space-y-3 mb-4">
							{morePages.map((page) => (
								<li key={page.path}>
									<Link
										to={page.path}
										className="block w-full text-center py-3 rounded-lg bg-ios-blue/10 text-ios-blue font-medium hover:bg-ios-blue/20 transition"
										onClick={() => setMoreOpen(false)}
									>
										{page.name}
									</Link>
								</li>
							))}
						</ul>
						<button
							onClick={() => setMoreOpen(false)}
							className="w-full py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</>
	);
}
