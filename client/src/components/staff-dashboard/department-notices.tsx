"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Layers, AlertCircle, ArrowRight, Calendar, User, Pin, Search, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import * as React from "react"
import { fetchNotices, type Notice } from "@/lib/notices-api"
import { toast } from "sonner"

export function DepartmentNotices() {
    const [notices, setNotices] = React.useState<Notice[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [pagination, setPagination] = React.useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    const observer = React.useRef<IntersectionObserver | null>(null);
    const lastNoticeElementRef = React.useCallback((node: HTMLDivElement | null) => {
        if (isLoading || isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && pagination.page < pagination.totalPages) {
                loadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, isLoadingMore, pagination.page, pagination.totalPages]);

    const loadNotices = React.useCallback(async (page: number = 1, append: boolean = false) => {
        if (append) setIsLoadingMore(true);
        else setIsLoading(true);
        
        setError(null);
        const result = await fetchNotices({
            audience: "STAFF",
            page,
            limit: 10,
            search: searchQuery
        });
        
        if (result.success && result.data) {
            if (append) {
                setNotices(prev => [...prev, ...result.data!.notices]);
            } else {
                setNotices(result.data.notices);
            }
            setPagination({
                total: result.data.total,
                page: result.data.page,
                limit: result.data.limit,
                totalPages: result.data.totalPages
            });
        } else {
            setError(result.error || "Failed to load notices");
            toast.error(result.error || "Failed to load notices");
        }
        
        setIsLoading(false);
        setIsLoadingMore(false);
    }, [searchQuery]);

    const loadMore = React.useCallback(() => {
        if (pagination.page < pagination.totalPages && !isLoadingMore) {
            loadNotices(pagination.page + 1, true);
        }
    }, [pagination.page, pagination.totalPages, isLoadingMore, loadNotices]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            loadNotices(1, false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const pinnedNotices = notices.filter(n => n.pinned);
    const otherNotices = notices.filter(n => !n.pinned);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading notices...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
                <Button variant="ghost" size="sm" onClick={() => loadNotices()} className="ml-auto">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search notices..."
                        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="ghost" size="icon" onClick={() => loadNotices()} disabled={isLoading}>
                    <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {pinnedNotices.length > 0 && (
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold text-sm text-muted-foreground">
                        <Pin className="h-4 w-4 rotate-45" /> Pinned Announcements
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {pinnedNotices.map(notice => (
                            <DeptNoticeCard key={notice.id} notice={notice} />
                        ))}
                    </div>
                    <Separator />
                </div>
            )}

            <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Department Notices</h3>
                <div className="grid gap-4 md:grid-cols-1">
                    {otherNotices.length > 0 ? (
                        otherNotices.map((notice, index) => {
                            const isLastElement = index === otherNotices.length - 1;
                            return (
                                <div 
                                    key={notice.id} 
                                    ref={isLastElement ? lastNoticeElementRef : null}
                                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    style={{ animationDelay: `${(index % 10) * 50}ms` }}
                                >
                                    <DeptNoticeCard notice={notice} />
                                </div>
                            );
                        })
                    ) : (
                        pinnedNotices.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                {searchQuery === "" ? "No department notices have been posted yet." : "No notices found matching your criteria."}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Infinite Scroll / Load More Trigger */}
            <div className="flex flex-col items-center justify-center py-8 border-t mt-4 gap-4">
                {pagination.page < pagination.totalPages && (
                    <Button 
                        variant="outline" 
                        onClick={loadMore} 
                        disabled={isLoadingMore}
                        className="min-w-[150px] relative overflow-hidden group transition-all duration-300 hover:pr-8"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                Load More Notices
                                <Plus className="absolute right-3 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />
                            </>
                        )}
                    </Button>
                )}
                
                {!isLoadingMore && pagination.page >= pagination.totalPages && pagination.total > 0 && (
                    <p className="text-sm text-muted-foreground italic">You&apos;ve reached the end of the notices.</p>
                )}
                
                {isLoadingMore && (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Fetching more updates...</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function DeptNoticeCard({ notice }: { notice: Notice }) {
    const formattedDate = new Date(notice.createdAt).toLocaleDateString();

    return (
        <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-sm border-none shadow-sm hover:translate-x-1 transition-all border-l-4 border-l-blue-500">
            <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-white/5 text-blue-600">
                    <Building2 className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Department</span>
                        <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-500">
                            Staff Only
                        </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold">{notice.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{notice.author.name}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{formattedDate}</span>
                        {notice.pinned && <Pin className="h-3 w-3 rotate-45 text-primary" />}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                        {notice.content}
                    </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardContent>
        </Card>
    );
}
