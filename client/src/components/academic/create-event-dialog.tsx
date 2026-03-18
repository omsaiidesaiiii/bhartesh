"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createEvent, uploadEventAttachment } from "@/app/actions/acdemics/main"
import { Plus, Upload, X, Image as ImageIcon } from "lucide-react"

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    type: z.enum(["EVENT", "HOLIDAY", "EXAM"]),
})

export function CreateEventDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            date: "",
            type: "EVENT",
        },
    })

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error("Only PNG, JPG, JPEG, GIF, and WEBP files are allowed")
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error("File size must be less than 5MB")
            return
        }

        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const removeFile = () => {
        setSelectedFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        
        let attachmentUrl: string | undefined

        // Upload file to CDN first if selected
        if (selectedFile) {
            const uploadRes = await uploadEventAttachment(selectedFile)
            if (!uploadRes.success) {
                toast.error(uploadRes.message || "Failed to upload attachment")
                setLoading(false)
                return
            }
            attachmentUrl = uploadRes.url
        }

        const res = await createEvent({
            ...values,
            date: new Date(values.date).toISOString(),
            attachmentUrl,
        })
        setLoading(false)

        if (res.success) {
            toast.success(res.message)
            setOpen(false)
            form.reset()
            removeFile()
        } else {
            toast.error(res.message)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) {
                removeFile()
            }
        }}>
            <DialogTrigger asChild>
                <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Academic Event</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Orientation Day" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="EVENT">Event</SelectItem>
                                                <SelectItem value="HOLIDAY">Holiday</SelectItem>
                                                <SelectItem value="EXAM">Exam</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-2">
                            <FormLabel>Attachment (Optional)</FormLabel>
                            {!selectedFile ? (
                                <div 
                                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        Click to upload image
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        PNG, JPG, GIF, WEBP (max 5MB)
                                    </p>
                                </div>
                            ) : (
                                <div className="relative border rounded-lg p-2">
                                    <div className="flex items-center gap-3">
                                        {previewUrl ? (
                                            <img 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                className="h-16 w-16 object-cover rounded"
                                            />
                                        ) : (
                                            <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={removeFile}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Event"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
