"use client"

import * as React from "react"
import { 
    Pin, 
    Search, 
    Loader2, 
    AlertCircle, 
    Calendar, 
    User, 
    Plus,
    ArrowRight,
    Megaphone
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    fetchNotices,
    type Notice
} from "@/lib/notices-api"
import { toast } from "sonner"

interface StudentNoticesProps {
    audience?: string;
}

export function StudentNotices({ audience }: StudentNoticesProps) {
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
            audience: audience === "all" ? undefined : audience,
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
    }, [audience, searchQuery]);

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
    }, [audience, searchQuery]);

    const pinnedNotices = notices.filter(n => n.pinned);
    const otherNotices = notices.filter(n => !n.pinned);

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

            {error && (
                <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                    <Button variant="ghost" size="sm" onClick={() => loadNotices()} className="ml-auto">Retry</Button>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Loading notices...</p>
                </div>
            ) : (
                <>
                    {/* Pinned Section */}
                    {pinnedNotices.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 font-semibold text-sm text-muted-foreground">
                                <Pin className="h-4 w-4 rotate-45" /> Pinned Announcements
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {pinnedNotices.map(notice => (
                                    <StudentNoticeCard key={notice.id} notice={notice} />
                                ))}
                            </div>
                            <Separator />
                        </div>
                    )}

                    {/* Main List */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground">Recent Notices</h3>
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
                                            <StudentNoticeCard notice={notice} />
                                        </div>
                                    );
                                })
                            ) : (
                                pinnedNotices.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                        {searchQuery === "" ? "No notices have been posted yet." : "No notices found matching your criteria."}
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
                </>
            )}
        </div>
    )
}

function StudentNoticeCard({ notice }: { notice: Notice }) {
    const formattedDate = new Date(notice.createdAt).toLocaleDateString();

    return (
        <Card className={notice.pinned ? "border-primary/50 bg-primary/5 transition-all hover:shadow-md" : "transition-all hover:shadow-md"}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{notice.title}</CardTitle>
                        {notice.pinned && <Pin className="h-3 w-3 text-primary rotate-45" />}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-xs mt-1">
                        <span className="font-medium text-foreground">{notice.author.name}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase">{notice.audience}</Badge>
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{notice.content}</p>
            </CardContent>
        </Card>
    )
}