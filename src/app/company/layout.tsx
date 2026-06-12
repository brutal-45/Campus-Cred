'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import {
 LayoutDashboard,
 PlusCircle,
 FileText,
 Users,
 Search,
 UserCheck,
 BarChart3,
 MessageSquare,
 Building2,
 LogOut,
 Menu,
 X,
 Home,
 Globe,
 ChevronRight,
 ClipboardList,
} from 'lucide-react';

const sidebarNavItems = [
 { label: 'Dashboard', href: '/company/dashboard', icon: LayoutDashboard },
 { label: 'Post Internship', href: '/company/post-internship', icon: PlusCircle },
 { label: 'Post Task', href: '/company/post-task', icon: ClipboardList },
 { label: 'Submissions', href: '/company/submissions', icon: FileText },
 { label: 'Talent Search', href: '/company/talent', icon: Search },
 { label: 'Hired Students', href: '/company/hired', icon: UserCheck },
 { label: 'Analytics', href: '/company/analytics', icon: BarChart3 },
 { label: 'Messages', href: '/company/messages', icon: MessageSquare },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
 const { user, logout, navigate } = useAppStore();
 const pathname = usePathname();
 const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
 const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

 const isActive = (href: string) => {
 if (href === '/company/dashboard') return pathname === '/company/dashboard';
 return pathname.startsWith(href);
 };

 return (
 <div className="min-h-screen bg-background flex flex-col">
 {/* Top header - mobile */}
 <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <button
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 className="p-1.5 rounded-lg hover:bg-muted transition-colors"
 >
 {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 <div className="flex items-center gap-2">
 <Building2 className="w-5 h-5 text-electric" />
 <span className="text-sm font-bold font-heading text-navy">CampusCred</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 {user && (
 <Avatar className="w-8 h-8">
 <AvatarFallback className="bg-electric text-white text-xs font-semibold">
 {user.fullName?.split(' ').map((n) => n[0]).join('') || 'C'}
 </AvatarFallback>
 </Avatar>
 )}
 </div>
 </div>
 </header>

 {/* Mobile dropdown menu */}
 <>
 {mobileMenuOpen && (
 <div
 className="animate-fade-in lg:hidden fixed inset-x-0 top-[57px] z-40 bg-card border-b border-border shadow-lg max-h-[70vh] overflow-y-auto"
 >
 <div className="p-4 space-y-1">
 {sidebarNavItems.map((item) => {
 const Icon = item.icon;
 const active = isActive(item.href);
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setMobileMenuOpen(false)}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
 active ? 'bg-electric/10 text-electric' : 'text-text-secondary hover:bg-muted'
 }`}
 >
 <Icon className="w-4 h-4" />
 {item.label}
 </Link>
 );
 })}
 <Separator className="my-2" />
 <Link
 href="/"
 className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-muted"
 >
 <Home className="w-4 h-4" />
 Back to Home
 </Link>
 <button
 onClick={logout}
 className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600"
 >
 <LogOut className="w-4 h-4" />
 Sign Out
 </button>
 </div>
 </div>
 )}
 </>

 <div className="flex flex-1">
 {/* Desktop sidebar */}
 <aside className={`hidden lg:flex flex-col border-r border-border bg-card sticky top-0 h-screen transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
 {/* Sidebar header */}
 <div className="p-4 border-b border-border">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center flex-shrink-0">
 <Building2 className="w-4 h-4 text-white" />
 </div>
 {!sidebarCollapsed && (
 <div>
 <CampusCredLogo size={28} variant="dark" />
 <p className="text-[10px] text-text-secondary">Company Portal</p>
 </div>
 )}
 <button
 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
 className="ml-auto p-1 rounded hover:bg-muted transition-colors flex-shrink-0"
 >
 <ChevronRight className={`w-3.5 h-3.5 text-text-secondary transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
 </button>
 </div>
 </div>

 {/* User info */}
 {user && !sidebarCollapsed && (
 <div className="p-4 border-b border-border">
 <div className="flex items-center gap-3">
 <Avatar className="w-10 h-10">
 <AvatarFallback className="bg-electric text-white text-sm font-semibold">
 {user.fullName?.split(' ').map((n) => n[0]).join('') || 'C'}
 </AvatarFallback>
 </Avatar>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold truncate">{user.fullName}</p>
 <p className="text-[10px] text-text-secondary truncate">Company Account</p>
 </div>
 </div>
 </div>
 )}

 {/* Navigation */}
 <ScrollArea className="flex-1">
 <nav className="p-3 space-y-1">
 {sidebarNavItems.map((item) => {
 const Icon = item.icon;
 const active = isActive(item.href);
 return (
 <Link
 key={item.href}
 href={item.href}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
 active
 ? 'bg-electric/10 text-electric shadow-sm'
 : 'text-text-secondary hover:bg-muted hover:text-foreground'
 } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
 >
 <Icon className="w-4 h-4 flex-shrink-0" />
 {!sidebarCollapsed && item.label}
 </Link>
 );
 })}

 {!sidebarCollapsed && (
 <>
 <Separator className="my-3" />
 <Link
 href="/"
 className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-muted hover:text-foreground transition-all duration-200"
 >
 <Home className="w-4 h-4" />
 Back to Home
 </Link>
 </>
 )}
 </nav>
 </ScrollArea>

 {/* Sidebar footer */}
 <div className="p-3 border-t border-border space-y-1">
 <button
 onClick={logout}
 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
 >
 <LogOut className="w-4 h-4 flex-shrink-0" />
 {!sidebarCollapsed && 'Sign Out'}
 </button>
 </div>
 </aside>

 {/* Main content */}
 <main className="flex-1 overflow-y-auto">
 <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
 <div className="animate-fade-in"key={pathname}>
 {children}
 </div>
 </div>
 </main>
 </div>

 {/* Bottom navigation - mobile */}
 <nav className="lg:hidden sticky bottom-0 z-50 bg-card border-t border-border px-2 py-1 safe-area-pb">
 <div className="flex items-center justify-around">
 {sidebarNavItems.slice(0, 4).map((item) => {
 const Icon = item.icon;
 const active = isActive(item.href);
 return (
 <Link
 key={item.href}
 href={item.href}
 className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-colors ${
 active ? 'text-electric' : 'text-text-secondary'
 }`}
 >
 <Icon className="w-5 h-5" />
 <span className="text-[9px] font-medium">{item.label}</span>
 </Link>
 );
 })}
 <Link
 href="/company/analytics"
 className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-colors ${
 isActive('/company/analytics') ? 'text-electric' : 'text-text-secondary'
 }`}
 >
 <BarChart3 className="w-5 h-5" />
 <span className="text-[9px] font-medium">Analytics</span>
 </Link>
 </div>
 </nav>
 </div>
 );
}
