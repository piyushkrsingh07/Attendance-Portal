"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarDays, Users, BarChart, Search, ChevronLeft, ChevronRight, UserCheck, UserX } from "lucide-react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from "sonner"
import StartAttendance from "./start-attendance"
import FreezeAttendance from "./freeze-attendance"
import axios from "axios"
import FlagUser from "./flag-user"
import { showAllUserDetails } from "@/lib/action"
import AddLeader from "./addLeader"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AttendanceDashboard() {
  const [apiData, setApiData] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null)
  const [selectedStudentNo, setSelectedStudentNo] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [attendance, setAttendance] = useState<{[key: string]: boolean}>({})
  const [activeTab, setActiveTab] = useState("overview")
  const [allUser, setAllUser] = useState<Object[]>([])

  const router=useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/getAttendanceOfAllUser")
        const data = await response.json()
        setApiData(data)
        setStudents(data.userAttendance)
        setAttendance(data.userAttendance.reduce((acc: {[key: string]: boolean}, student: any) => {
          acc[student._id] = false
          return acc
        }, {}))
      } catch (error) {
        console.error("Error fetching attendance data:", error)
        toast.error("Failed to fetch attendance data")
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
      const fetchAllUser = async () => {
        const allUsers = await showAllUserDetails() as Object[];
        setAllUser(allUsers)
        // console.log(allUser);
      }
      fetchAllUser();
  },[])
  

  const itemsPerPage = 10
  const filteredStudents = students.filter(student =>
    student.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleAttendanceChange = (studentId: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }))
  }

  const handleSubmitAttendance = async () => {
    try {
      const response = await fetch("/api/automaticMarkAbsent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendance),
      })
      if (response.ok) {
        setAttendance(students.reduce((acc, student) => ({ ...acc, [student._id]: false }), {}))
        toast.success("Attendance has been successfully recorded.")
      } else {
        throw new Error("Failed to submit attendance")
      }
    } catch (error) {
      console.error("Error submitting attendance:", error)
      toast.error("Failed to submit attendance")
    }
  }

  const handleViewStats = (student: any) => {
    console.log(student)
    setSelectedStudentId(student._id)
    setSelectedStudentName(student.Name)
    setSelectedStudentNo(student.studentNo)
    setActiveTab("statistics")
  }

  const AttendanceSummary = () => (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apiData?.totalStudents || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apiData?.presentToday || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apiData?.averageAttendanceRate || 0}%</div>
        </CardContent>
      </Card>
    </div>
  )

  const AttendanceTable = () => (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Present</TableHead>
            <TableHead>Absent</TableHead>
            <TableHead>Attendance Rate</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedStudents.map((student) => (
            <TableRow key={student._id}>
              <TableCell className="font-medium">{student.Name || 'N/A'}</TableCell>
              <TableCell>{student.totalPresent}</TableCell>
              <TableCell>{student.totalAbsent}</TableCell>
              <TableCell>{student.attendanceRate}%</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleViewStats(student)}>View Stats</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const ManualAttendance = () => (
    <div className="space-y-4">
      <Table>
        {/* <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Present</TableHead>
          </TableRow>
        </TableHeader> */}
        {/* <TableBody>
          {paginatedStudents.map((student) => (
            <TableRow key={student._id}>
              <TableCell className="font-medium">{student.Name || 'N/A'}</TableCell>
              <TableCell>
                <Checkbox
                  checked={attendance[student._id] || false}
                  onCheckedChange={() => handleAttendanceChange(student._id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody> */}
      </Table>
      <Button onClick={handleSubmitAttendance} className="w-full">
        Mark Rest of the Students Absent
      </Button>
    </div>
  )


  const StudentStatistics = () => {
    if (!selectedStudentId || !selectedStudentName) {
      return <p className="text-center text-gray-500">Select a student to view their statistics.</p>
    }

    const selectedStudent = students.find(student => student._id === selectedStudentId)

    if (!selectedStudent) {
      return <p className="text-center text-gray-500">Student data not found.</p>
    }

    const attendanceData = [
      { name: 'Present', value: selectedStudent.totalPresent },
      { name: 'Absent', value: selectedStudent.totalAbsent },
    ]

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{selectedStudentName}'s Attendance Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Classes</p>
                <p className="text-2xl font-bold">{selectedStudent.totalPresent + selectedStudent.totalAbsent}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-bold">{selectedStudent.attendanceRate}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Present</p>
                <p className="text-2xl font-bold">{selectedStudent.totalPresent}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Absent</p>
                <p className="text-2xl font-bold">{selectedStudent.totalAbsent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <FlagUser allUser= {selectedStudent} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance Management System</h1>
        <div className="relative w-64 flex gap-2">
          <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
                        <Button
                          className="bg-red-500 hover:bg-red-600"
                          onClick={async() => {
                             await signOut({ redirect: false }); // only logs out
                                 router.push("/"); 
                          }
                         
                          }
                        >
                          Signout
                        </Button>
        </div>
      </header>
      <AttendanceSummary />
      <div className="flex md:flex-row flex-col items-center justify-center gap-12">
      <StartAttendance />
      <FreezeAttendance />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Users className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="mark-attendance">
            <CalendarDays className="mr-2 h-4 w-4" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="Add Leader">
            <BarChart className="mr-2 h-4 w-4" />
            Add Leader
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance Overview</CardTitle>
              <CardDescription>View and manage student attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mark-attendance">
          <Card>
            <CardHeader>
              <CardTitle>Mark All Absent</CardTitle>
              <CardDescription>Manually mark attendance for students</CardDescription>
            </CardHeader>
            <CardContent>
              <ManualAttendance />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Student Statistics</CardTitle>
              <CardDescription>View detailed attendance statistics for each student</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentStatistics />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="Add Leader">
           <AddLeader />
        </TabsContent>
      </Tabs>
    </div>
  )
}