"use client"

import * as React from "react"
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
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { createNotice } from "@/lib/notices-api"
import { toast } from "sonner"

interface CreateNoticeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateNoticeDialog({ open, onOpenChange }: CreateNoticeDialogProps) {
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [audience, setAudience] = React.useState("ALL");
    const [pinned, setPinned] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleCreate = async () => {
        if (!title || !content) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        const result = await createNotice({
            title,
            content,
            audience,
            pinned
        });
        if (result.success) {
            toast.success("Notice posted successfully");
            onOpenChange(false);
            // Reset form
            setTitle("");
            setContent("");
            setAudience("ALL");
            setPinned(false);
            // Optionally refresh the notices
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to create notice");
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Notice</DialogTitle>
                    <DialogDescription>
                        Post a new announcement to the dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Exam Schedule Released" disabled={isSubmitting} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="audience">Target Audience</Label>
                        <Select value={audience} onValueChange={setAudience} disabled={isSubmitting}>
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
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type your message here..."
                            className="min-h-[100px]"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch id="pinned" checked={pinned} onCheckedChange={setPinned} disabled={isSubmitting} />
                        <Label htmlFor="pinned">Pin to top</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post Notice
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}