"use client"

import * as React from "react"
import {
    TrendingUp,
    Users,
    GraduationCap,
    CalendarDays,
    Download
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    fetchReportSummary,
    fetchAttendanceTrends,
    fetchDepartmentPerformance,
    fetchPassRateData,
    fetchStaffActivity,
    fetchAcademicStats
} from "@/app/actions/reports/main";
import {
    AttendanceTrend,
    DepartmentPerformance,
    PassRateData,
    StaffActivity,
    ReportSummary,
    TopClass,
    RecentAssessment
} from "@/app/actions/reports/types";
import { toast } from "sonner";

const COLORS = ['#22c55e', '#ef4444'];

export default function ReportsPage() {
    const [year, setYear] = React.useState("2024");
    const [loading, setLoading] = React.useState(true);
    const [summary, setSummary] = React.useState<ReportSummary | null>(null);
    const [attendanceTrends, setAttendanceTrends] = React.useState<AttendanceTrend[]>([]);
    const [deptPerformance, setDeptPerformance] = React.useState<DepartmentPerformance[]>([]);
    const [passRate, setPassRate] = React.useState<PassRateData[]>([]);
    const [staffActivity, setStaffActivity] = React.useState<StaffActivity[]>([]);
    const [academicStats, setAcademicStats] = React.useState<{ topClasses: TopClass[], recentAssessments: RecentAssessment[] }>({ topClasses: [], recentAssessments: [] });

    const loadData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [
                summaryRes,
                attendanceRes,
                deptRes,
                passRes,
                staffRes,
                academicRes
            ] = await Promise.all([
                fetchReportSummary(year),
                fetchAttendanceTrends(year),
                fetchDepartmentPerformance(year),
                fetchPassRateData(year),
                fetchStaffActivity(year),
                fetchAcademicStats(year)
            ]);

            if (summaryRes.success) setSummary(summaryRes.data!);
            if (attendanceRes.success) setAttendanceTrends(attendanceRes.data!);
            if (deptRes.success) setDeptPerformance(deptRes.data!);
            if (passRes.success) setPassRate(passRes.data!);
            if (staffRes.success) setStaffActivity(staffRes.data!);
            if (academicRes.success) setAcademicStats(academicRes.data!);

        } catch (error) {
            toast.error("Failed to load report data");
        } finally {
            setLoading(false);
        }
    }, [year]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Comprehensive insights into campus performance and metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export All
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.totalStudents ?? "0"}</div>
                        <p className="text-xs text-muted-foreground">{summary?.totalStudentsChange ?? "--"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                        <CalendarDays className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.avgAttendance ?? 0}%</div>
                        <p className="text-xs text-muted-foreground">{summary?.avgAttendanceNote ?? "No data"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                        <GraduationCap className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.passRate ?? 0}%</div>
                        <p className="text-xs text-muted-foreground">{summary?.passRateChange ?? "--"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Department Perf.</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.topDept ?? "N/A"}</div>
                        <p className="text-xs text-muted-foreground">{summary?.topDeptNote ?? "--"}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Result Analysis (Pass vs Fail)</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center">Loading...</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={passRate}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {passRate.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Department Performance</CardTitle>
                                <CardDescription>Average score per department</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center">Loading...</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart layout="vertical" data={deptPerformance}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="name" type="category" width={100} />
                                                <Tooltip />
                                                <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Attendance Trends</CardTitle>
                            <CardDescription>Monthly average attendance percentage.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px]">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center">Loading...</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={attendanceTrends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} name="Present %" />
                                            <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent %" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staff" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Staff Activity</CardTitle>
                            <CardDescription>Active staff members on campus over the week.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px]">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center">Loading...</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={staffActivity}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="active" fill="#8884d8" radius={[4, 4, 0, 0]} name="Active Staff" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Classes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {academicStats.topClasses.length > 0 ? academicStats.topClasses.map((cls, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {i + 1}
                                                </div>
                                                <span className="font-medium">{cls.name}</span>
                                            </div>
                                            <div className="font-bold text-muted-foreground">
                                                {cls.avg}% Avg
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-muted-foreground">No class data available</p>}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Assessments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {academicStats.recentAssessments.length > 0 ? academicStats.recentAssessments.map((exam, i) => (
                                        <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                                            <div>
                                                <p className="font-medium">{exam.name}</p>
                                                <p className="text-xs text-muted-foreground">Completed on {exam.date}</p>
                                            </div>
                                            <Button variant="ghost" size="sm">View Report</Button>
                                        </div>
                                    )) : <p className="text-sm text-muted-foreground">No recent assessments</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    )
}
