"use client"

import * as React from "react"
import {
    Pin,
    Trash2,
    Edit,
    Plus,
    Search,
    MoreVertical,
    Loader2,
    AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    fetchNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    toggleNoticePin,
    type Notice
} from "@/lib/notices-api"
import { toast } from "sonner"

export default function NoticesPage() {
    const [notices, setNotices] = React.useState<Notice[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filterAudience, setFilterAudience] = React.useState("all");
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

    // Form State
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [newTitle, setNewTitle] = React.useState("");
    const [newContent, setNewContent] = React.useState("");
    const [newAudience, setNewAudience] = React.useState("ALL");
    const [newPinned, setNewPinned] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const loadNotices = React.useCallback(async (page: number = 1, append: boolean = false) => {
        if (append) setIsLoadingMore(true);
        else setIsLoading(true);
        
        setError(null);
        const result = await fetchNotices({
            audience: filterAudience,
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
    }, [filterAudience, searchQuery]);

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
    }, [filterAudience, searchQuery]);

    const handleCreateNotice = async () => {
        if (!newTitle || !newContent) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        if (editingId) {
            const result = await updateNotice(editingId, {
                title: newTitle,
                content: newContent,
                audience: newAudience,
                pinned: newPinned
            });
            if (result.success) {
                toast.success("Notice updated successfully");
                loadNotices();
                setEditingId(null);
                setIsCreateOpen(false);
            } else {
                toast.error(result.error || "Failed to update notice");
            }
        } else {
            const result = await createNotice({
                title: newTitle,
                content: newContent,
                audience: newAudience,
                pinned: newPinned
            });
            if (result.success) {
                toast.success("Notice posted successfully");
                loadNotices();
                setIsCreateOpen(false);
            } else {
                toast.error(result.error || "Failed to create notice");
            }
        }
        setIsSubmitting(false);

        // Reset
        setNewTitle("");
        setNewContent("");
        setNewAudience("ALL");
        setNewPinned(false);
    };

    const handleEditClick = (notice: Notice) => {
        setNewTitle(notice.title);
        setNewContent(notice.content);
        setNewAudience(notice.audience);
        setNewPinned(notice.pinned);
        setEditingId(notice.id);
        setIsCreateOpen(true);
    };

    const handleDelete = async (id: string) => {
        const result = await deleteNotice(id);
        if (result.success) {
            toast.success("Notice deleted");
            setNotices(prev => prev.filter(n => n.id !== id));
        } else {
            toast.error(result.error || "Failed to delete notice");
        }
    };

    const togglePin = async (id: string) => {
        const result = await toggleNoticePin(id);
        if (result.success) {
            setNotices(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
        } else {
            toast.error(result.error || "Failed to toggle pin");
        }
    };

    // Pinned notices are usually filtered by search as well
    const pinnedNotices = notices.filter(n => n.pinned);
    const otherNotices = notices.filter(n => !n.pinned);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notices & Announcements</h1>
                    <p className="text-muted-foreground">Create and manage updates for staff and students.</p>
                </div>
                <Button onClick={() => {
                    setEditingId(null);
                    setNewTitle("");
                    setNewContent("");
                    setNewAudience("ALL");
                    setNewPinned(false);
                    setIsCreateOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Create Notice
                </Button>
            </div>

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
                <Select value={filterAudience} onValueChange={setFilterAudience}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Audience" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Audiences</SelectItem>
                        <SelectItem value="staff">Staff Only</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                    </SelectContent>
                </Select>
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
                                    <NoticeCard
                                        key={notice.id}
                                        notice={notice}
                                        onEdit={handleEditClick}
                                        onDelete={handleDelete}
                                        onPin={togglePin}
                                    />
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
                                            <NoticeCard
                                                notice={notice}
                                                onEdit={handleEditClick}
                                                onDelete={handleDelete}
                                                onPin={togglePin}
                                            />
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

            {/* Create/Edit Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Notice" : "Create New Notice"}</DialogTitle>
                        <DialogDescription>
                            Post a new announcement to the dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Exam Schedule Released" disabled={isSubmitting} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="audience">Target Audience</Label>
                            <Select value={newAudience} onValueChange={setNewAudience} disabled={isSubmitting}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Users</SelectItem>
                                    <SelectItem value="STAFF">Staff Only</SelectItem>
                                    <SelectItem value="STUDENTS">Students Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Type your message here..."
                                className="min-h-[100px]"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch id="pinned" checked={newPinned} onCheckedChange={setNewPinned} disabled={isSubmitting} />
                            <Label htmlFor="pinned">Pin to top</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleCreateNotice} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingId ? "Update" : "Post Notice"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}

function NoticeCard({ notice, onEdit, onDelete, onPin }: {
    notice: Notice,
    onEdit: (n: Notice) => void,
    onDelete: (id: string) => void,
    onPin: (id: string) => void
}) {
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onPin(notice.id)}>
                            <Pin className="mr-2 h-4 w-4" />
                            {notice.pinned ? "Unpin Notice" : "Pin Notice"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(notice)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive font-medium focus:text-destructive" onClick={() => onDelete(notice.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{notice.content}</p>
            </CardContent>
        </Card>
    )
}
