'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Terminal, 
    Workflow, 
    Settings, 
    Home, 
    Monitor,
    Zap,
    Box
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function Navigation() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        // { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, // Assuming /dashboard might exist or be future
        { name: 'Management', href: '/manage', icon: Monitor },
        { name: 'Test Scripts', href: '/command', icon: Terminal },
        { name: 'Workflows', href: '/workflows', icon: Workflow },
        { name: 'Visual Regression', href: '/visual-regression', icon: Box },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <nav 
            className={cn(
                "fixed left-0 top-0 h-screen bg-[#0A0A0A] border-r border-neutral-800 transition-all duration-300 z-50 flex flex-col",
                isCollapsed ? "w-16" : "w-64"
            )}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            <div className="p-4 flex items-center justify-center border-b border-neutral-800 h-16">
                <div className="flex items-center space-x-2 overflow-hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-white fill-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="font-bold text-lg text-white tracking-tight animate-in fade-in duration-200 whitespace-nowrap">
                            NEXUS
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 py-6 flex flex-col gap-2 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative",
                                isActive 
                                    ? "bg-violet-600/10 text-violet-400" 
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0", isActive && "fill-current")} />
                            {!isCollapsed && (
                                <span className="text-sm font-medium animate-in fade-in duration-200 whitespace-nowrap">
                                    {item.name}
                                </span>
                            )}
                            {isCollapsed && isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-l-full" />
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-neutral-800">
                <div className={cn("flex items-center space-x-3", isCollapsed ? "justify-center" : "")}>
                   <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-neutral-300">AD</span>
                   </div>
                   {!isCollapsed && (
                       <div className="overflow-hidden">
                           <p className="text-sm font-bold text-white truncate">Admin User</p>
                           <p className="text-xs text-neutral-500 truncate">admin@nexus.ai</p>
                       </div>
                   )}
                </div>
            </div>
        </nav>
    );
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
     return (
        <div className="pl-16 min-h-screen bg-neutral-950 transition-all duration-300">
            {children}
        </div>
     );
}
