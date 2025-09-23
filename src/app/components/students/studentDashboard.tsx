"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  User,
  CheckCircle,
  Book,
  BarChart2,
  Clock,
  AlertTriangle,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
  Flag,
  Github,
  Code,
  Coffee,
  Terminal,
  X,
} from "lucide-react";
import { format, parseISO, isToday, differenceInMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditProfilePopup } from "./edit-student-profile";
import axios from "axios";
import {
  fetchUserProjects,
  LeaderAccess,
  saveNewProject,
  showAttendence,
  showFlaggedUserDetail,
  showFlaggedUserDetailStudent,
} from "@/lib/action";
import { signOut, useSession } from "next-auth/react";
import StudentNavbar from "./navbar";
import { toast } from "sonner";
import ProfilPicture from "./profile/profilePicture";
import { FiCheckCircle } from "react-icons/fi";
import { FaTimesCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import GroupProject from "./groupProject";
import NotALeader from "./notLeader";
import FinalProject from "./finalProject";
import { useRouter } from "next/navigation";
import AttendanceSkeleton from "./skeletons/attendance-skeleton";
import SubmittedProjects from "./components/submitted-projects/submittedProjects";
import SkeletonSubmitted from "./components/submitted-projects/skeletonSubmitted";

interface userFlagCount {
  flagCount: number | null;
}

const initialStudentData = {
  name: "John Doe",
  id: "S12345",
  course: "Computer Science",
  email: "john.doe@example.com",
  year: "3rd Year",
  totalClasses: 100,
  attendedClasses: 85,
};

interface ProfileLinks {
  github: string;
  leetcode: string;
  codechef: string;
  codeforces: string;
}

// Simulated attendance window (10 minutes from now)
const attendanceWindowStart = new Date();
const attendanceWindowEnd = new Date(
  attendanceWindowStart.getTime() + 10 * 60000
);

// Mock project data
const projectData = [
  {
    id: 1,
    name: "Web Development Project",
    description: "Create a responsive website using React and Next.js",
    dueDate: "2023-06-15",
    status: "In Progress",
    updates: [
      { date: "2023-05-01", comment: "Started project planning" },
      { date: "2023-05-03", comment: "Completed wireframes" },
    ],
  },
  {
    id: 2,
    name: "Machine Learning Assignment",
    description: "Implement a neural network for image classification",
    dueDate: "2023-06-30",
    status: "Not Started",
    updates: [],
  },
];

export default function EnhancedStudentDashboard() {
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAttendanceWindowOpen, setIsAttendanceWindowOpen] = useState(true);
  const [projects, setProjects] = useState(projectData);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    dueDate: "",
  });
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    name: string;
    description: string;
    dueDate: string;
    status: string;
    updates: { date: string; comment: string }[];
  } | null>(null);
  const [newUpdate, setNewUpdate] = useState("");
  const [studentData, setStudentData] = useState(initialStudentData);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [attendanceData, setAttendanceData] = useState<
    { date: string; status: string }[]
  >([]);
  const [isMounted, setIsMounted] = useState(false);
  const [userDetail, setUserDetail] = useState<{
    Name: string;
    studentNo: number;
    _id: string;
  }>({
    Name: "",
    studentNo: 0,
    _id: "",
  });
  const [profileLinks, setProfileLinks] = useState<ProfileLinks>({
    github: "",
    leetcode: "",
    codechef: "",
    codeforces: "",
  });
  const [windowOpen, setWindowOpen] = useState<boolean | null>(null);
  const [fetchExistingFlag, setfetchExistingFlag] = useState<number>(0);
  const [submittedProjects, setSubmittedProjects] = useState<any[]>([]);
  const { data: session } = useSession();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalPresent, setTotalPresent] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [name, setName] = useState("");
  const [studentno, setStudentNo] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [checkLeaderAccess, setCheckLeaderAccess] = useState<boolean>(false);
  const router = useRouter();
  const [attendanceLoadingstate, setattendanceLoadingstate] = useState(false);

  // console.log(session,"wwedwedd")

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (now >= attendanceWindowEnd) {
        setIsAttendanceWindowOpen(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attendanceWindowEnd, isMounted]);

  const markAttendance = useCallback(async () => {
    await axios
      .post("/api/mark-attendance")
      .then((data) => {
        // console.log(data)
      })
      .catch((err) => console.log(err));
    setAttendanceMarked(true);
  }, [attendanceMarked]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/checkStatusAttendance"); // Adjust the API route as necessary
        const data = await response.json();

        if (response.status === 200) {
          setWindowOpen(true);
        } else {
          setWindowOpen(false);
          console.error("Failed to fetch status:", data.error);
        }
      } catch (error) {
        console.error("Error fetching attendance status:", error);
      }
    };

    // Poll every second
    const intervalId = setInterval(fetchStatus, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const getUserDetails = async () => {
      if (session?.user.studentNo) {
        try {
          const response = await fetch("/api/user-detail", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ studentNo: session.user.studentNo }),
          });

          const detail = await response.json();

          if (response.status === 200) {
            const stuname = detail.userDetail?.Name;
            const stuno = detail.userDetail?.studentNo;
            setName(stuname ?? "");
            setStudentNo(stuno ?? "");
          } else {
            // Handle error cases
            console.error(detail.error || detail.message);
          }
        } catch (err: any) {
          // Handle fetch error
          console.error(err.message);
        }
      }
    };

    if (session?.user.studentNo) {
      getUserDetails();
    }
  }, [session]);

  useEffect(() => {
    const checkLeader = async () => {
      const check = await LeaderAccess(session?.user.studentNo);
      if (check.success) {
        setCheckLeaderAccess(true);
      } else {
        setCheckLeaderAccess(false);
      }
    };
    checkLeader();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      const data = await showAttendence();
      if (Array.isArray(data)) {
        setAttendanceData((prevData) => {
          const newData = data.map((item) => ({
            date: item.date,
            status: item.status,
          }));
          const uniqueData = Array.from(
            new Set([...prevData, ...newData].map((item) => item.date))
          )
            .map((date) => {
              return [...prevData, ...newData].find(
                (item) => item.date === date
              );
            })
            .filter(
              (item): item is { date: string; status: string } =>
                item !== undefined
            );
          setattendanceLoadingstate(true);
          return uniqueData;
        });
      } else {
        console.error("Invalid data format", data);
      }
    };

    fetchAttendance();
  }, []);

  const handleProjectSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitted(true);
    console.log(isSubmitted);
  };

  useEffect(() => {
    if (isSubmitted) {
      const submitProject = async () => {
        if (newProject.description.length > 1000) {
          toast.error("Description should be less than 500 words!!!");
          setIsSubmitted(false);
          return;
        }
        console.log("here krish");
        const task = await saveNewProject(
          newProject.name,
          newProject.description,
          newProject.dueDate
        );
        console.log(task);
        if (
          typeof task === "object" &&
          task !== null &&
          "status" in task &&
          (task as { status: number }).status === 200
        ) {
          toast.success("Task Successfully Submitted!!", {
            icon: <FiCheckCircle color="#4CAF50" />,
          });
          setNewProject({ name: "", description: "", dueDate: "" });
        } else {
          toast.error("Failed to submit task, Task already submitted !!!", {
            icon: <FaTimesCircle color="#F44336" />,
          });
        }
        setIsSubmitted(false);
      };
      submitProject();
      // toast.error("portal closed");
    }
  }, [isSubmitted]);

  const handleProfileUpdate = (updatedData: any) => {
    setStudentData(updatedData);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendanceData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(attendanceData.length / recordsPerPage);

  useEffect(() => {
    if (attendanceData && attendanceData.length > 0) {
      const totalClasses = attendanceData.length;
      const totalPresent = attendanceData.filter(
        (record) => record.status === "present"
      ).length;
      const attendancePercentage = (totalPresent / totalClasses) * 100;
      console.log(totalClasses, totalPresent, attendancePercentage);

      setTotalClasses(totalClasses);
      setTotalPresent(totalPresent);
      setAttendancePercentage(parseFloat(attendancePercentage.toFixed(2))); // To keep two decimal places
    }
  }, [attendanceData]);

  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const showFlaguser = async () => {
      // console.log(userDetail._id,"kakak")
      const user = (await showFlaggedUserDetailStudent(
        session?.user.studentNo
      )) as userFlagCount | null;
      //  console.log(user),"kjhkkn";
      setfetchExistingFlag(user?.flagCount ?? 0);
      if ((user?.flagCount ?? 0) > 0) {
        setShowPopup(true);
      }
    };
    showFlaguser();
  }, []);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();

        if (response.status === 200) {
          setSubmittedProjects(data.projects);
        } else {
          // Handle error cases
          console.error(data.error);
        }
      } catch (err: any) {
        // Handle fetch error
        toast.error("Failed to fetch projects");
        console.error(err.message);
      }
    };

    getProjects();
  }, [isSubmitted]);

  const handleProfileLinksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/profileLink", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileLinks),
    });
    console.log(response);
    if (!response.ok) {
      const data = await response.json();
      console.error("Failed to submit profile links:", data);
      toast.error("Failed to submit profile links");
      return;
    }
    console.log("Submitting profile links:", profileLinks);
    toast.success("Profile Links Submitted");
    setProfileLinks({
      github: "",
      leetcode: "",
      codechef: "",
      codeforces: "",
    });
  };

  return (
    <>
      <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-56 w-56">
                  <AvatarFallback>
                    {/* {userDetail.Name.split(" ")
                      .map((n) => n[0])
                      .join("")} */}
                    <ProfilPicture />
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">{name}</h2>
                  {/* <p className="text-gray-500">{studentData.id}</p> */}
                  <p className="text-gray-500">{studentno}</p>
                  <p className="text-gray-500">2nd year</p>
                  {/* <p className="text-gray-500">{studentData.email}</p> */}
                </div>
              </div>
            </CardContent>
            <Card className="w-1/2 mb-7 mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Flag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Flag className="w-6 h-6 text-yellow-500" />
                    <span className="text-3xl font-bold">
                      {fetchExistingFlag}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {fetchExistingFlag > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-[90%] max-w-md mx-auto"
              >
                <Card className="bg-red-100 mb-4 border-red-500 border-2">
                  <CardContent className="p-6">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="flex items-center justify-center gap-2 mb-4"
                    >
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                      <h2 className="text-2xl font-bold text-red-600">
                        WARNING
                      </h2>
                    </motion.div>
                    <p className="text-center text-red-700 font-semibold mb-2">
                      Your account has been flagged, {name}!
                    </p>
                    <p className="text-center text-red-600">
                      You have received {fetchExistingFlag} flag
                      {fetchExistingFlag > 1 ? "s" : ""}. 3 flags will result in
                      immediate termination from probation.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            <AnimatePresence>
              {showPopup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    className="w-[90%] max-w-md"
                  >
                    <Card className="bg-red-100 border-red-500 border-2">
                      <CardHeader className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => setShowPopup(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <CardTitle className="text-center text-2xl font-bold text-red-600">
                          URGENT WARNING
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="flex items-center justify-center gap-2 mb-4"
                        >
                          <AlertTriangle className="w-12 h-12 text-red-600" />
                        </motion.div>
                        <p className="text-center text-red-700 font-semibold mb-4">
                          {name}, your account has been flagged!
                        </p>
                        <p className="text-center text-red-600 mb-4">
                          You have received {fetchExistingFlag} flag
                          {fetchExistingFlag > 1 ? "s" : ""}. This is a serious
                          matter that requires your immediate attention.
                        </p>
                        <p className="text-center text-red-700 font-semibold mb-2">
                          Possible reasons for flagging:
                        </p>
                        <ul className="list-disc list-inside text-red-600 mb-4">
                          <li>Late submission of profile links</li>
                          <li>Incomplete project submissions</li>
                          <li>Missing or inappropriate profile photo</li>
                        </ul>
                        <p className="text-center text-red-600 font-bold">
                          IMPORTANT: 3 flags will result in immediate
                          termination from probation. Please address any
                          outstanding issues immediately to avoid further
                          consequences.
                        </p>
                      </CardContent>
                      <CardFooter className="justify-center">
                        <Button
                          variant="destructive"
                          onClick={() => setShowPopup(false)}
                        >
                          I Understand
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <CardFooter className="flex justify-center gap-4 md:flex-row flex-col">
              <EditProfilePopup
                studentData={userDetail}
                onSave={handleProfileUpdate}
              />
              {session && session.user.role === "admin" && (
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => router.push("/admin")}
                >
                  Admin
                </Button>
              )}
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
            </CardFooter>
          </Card>
          <Card className="lg:col-span-2">
            <Tabs defaultValue="attendance" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                {/* <TabsTrigger value="timetable">Timetable</TabsTrigger> */}
                {/* <TabsTrigger value="project">Final Project Submission</TabsTrigger> */}
                <TabsTrigger value="projects">Projects</TabsTrigger>
                {/* <TabsTrigger value="groupProject">Group</TabsTrigger> */}
                <TabsTrigger value="stats">Statistics</TabsTrigger>

                <TabsTrigger value="profile-links">Profile</TabsTrigger>
              </TabsList>
              <TabsContent value="attendance">
                <CardHeader>
                  <CardTitle>Attendance Record</CardTitle>
                  <CardDescription>
                    Your recent attendance history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <div> */}
                  {attendanceData.length > 0 ? (
                    <div className="space-y-4">
                      {currentRecords.map((day, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-white rounded-lg shadow"
                        >
                          <span className="font-medium">
                            {formatDate(day.date)}
                          </span>
                          <Badge
                            variant={
                              day.status === "present"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {day.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <AttendanceSkeleton />
                  )}
                  {/* </div> */}
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <Label htmlFor="recordsPerPage" className="mr-2">
                      Records per page:
                    </Label>
                    <Select
                      value={recordsPerPage.toString()}
                      onValueChange={(value) => {
                        setRecordsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </TabsContent>
              <TabsContent value="projects">
                <div className="relative">
                  <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>
                      Manage your projects and track progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="new" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="new">New Project</TabsTrigger>
                        {/* <TabsTrigger value="submitted">
                          Submitted Projects
                        </TabsTrigger> */}
                      </TabsList>
                      <TabsContent value="new">
                        <div className="bg-white p-4 rounded-lg shadow mt-4 relative">
                          {/* Overlay for New Project section */}
                          {/* <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                            <div className="bg-white p-8 w-64 md:w-full rounded-lg shadow-lg max-w-md text-center transform transition-transform duration-300 scale-105 hover:scale-100">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-blue-500 mb-4 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13 16h-1v-4h-1m1-4h.01M12 8v4m0 4h.01M4 12h16M4 12a9.963 9.963 0 00.854-4.636C5.052 5.516 8.417 2 12 2s6.948 3.516 7.146 5.364A9.963 9.963 0 0016 12h-4z"
                                />
                              </svg>
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Portal Closed
                              </h2>
                              <p className="text-gray-600 mb-6">
                                We're sorry, but the portal is currently closed.
                                Please check back later.
                              </p>
                              <a
                                href="https://bdcoe.co.in/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                                onClick={() => console.log("More Information")}
                              >
                                More Information
                              </a>
                            </div>
                          </div> */}
                          <h3 className="font-semibold text-lg mb-4">
                            Submit New Project
                          </h3>
                          <form
                            onSubmit={handleProjectSubmit}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="projectName">Project Name</Label>
                              <Input
                                id="projectName"
                                value={newProject.name}
                                onChange={(e) =>
                                  setNewProject({
                                    ...newProject,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="projectDescription">
                                Description
                              </Label>
                              <Textarea
                                id="projectDescription"
                                value={newProject.description}
                                onChange={(e) =>
                                  setNewProject({
                                    ...newProject,
                                    description: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="projectDueDate">
                                Submission Date
                              </Label>
                              <Input
                                id="projectDueDate"
                                type="date"
                                value={newProject.dueDate}
                                onChange={(e) =>
                                  setNewProject({
                                    ...newProject,
                                    dueDate: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <Button type="submit">Submit Project</Button>
                          </form>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </div>
              </TabsContent>
              {
                checkLeaderAccess ?  <TabsContent value="groupProject"><GroupProject session={session} /></TabsContent> : <TabsContent value="groupProject"> <NotALeader /> </TabsContent>
              }
             <TabsContent value="project"><FinalProject session={session} /></TabsContent>

              <TabsContent value="stats"> <div className="relative">
                  <CardHeader>
                    <CardTitle>Attendance Statistics</CardTitle>
                    <CardDescription>
                      Your overall attendance performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Overall Attendance
                        </span>
                        <span className="text-sm font-medium">
                          {attendancePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={attendancePercentage}
                        className="w-full"
                      />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                          <Book className="mx-auto h-6 w-6 text-blue-500" />
                          <p className="mt-2 font-semibold">{totalClasses}</p>
                          <p className="text-sm text-gray-500">
                            Total Sessions
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                          <CheckCircle className="mx-auto h-6 w-6 text-green-500" />
                          <p className="mt-2 font-semibold">{totalPresent}</p>
                          <p className="text-sm text-gray-500">
                            Session Attended
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                          <FileText className="mx-auto h-6 w-6 text-purple-500" />
                          <p className="mt-2 font-semibold">
                            {submittedProjects.length}
                          </p>
                          <p className="text-sm text-gray-500">
                            Projects Submitted
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </TabsContent>
              <TabsContent value="profile-links">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Links</CardTitle>
                    <CardDescription>
                      Add your coding profile links
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleProfileLinksSubmit}
                      className="space-y-4"
                    >
                      <div className=" flex w-full space-x-4 items-center">
                        <Github className="w-5 h-5 text-gray-500" />
                        <Label htmlFor="github">GitHub</Label>
                        </div>
                          <Input
                            id="github"
                            placeholder="https://github.com/yourusername"
                            value={profileLinks.github}
                            onChange={(e) =>
                              setProfileLinks({
                                ...profileLinks,
                                github: e.target.value,
                              })
                            }
                            required
                          />
                        <div className="flex items-center space-x-4">
                          <Code className="w-5 h-5 text-gray-500" />
                          <Label htmlFor="leetcode">LeetCode</Label>
                        </div>
                          <Input
                            id="leetcode"
                            placeholder="https://leetcode.com/yourusername"
                            value={profileLinks.leetcode}
                            className="w-[800px"
                            onChange={(e) =>
                              setProfileLinks({
                                ...profileLinks,
                                leetcode: e.target.value,
                              })
                            }
                            required
                          />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Coffee className="w-5 h-5 text-gray-500" />
                        <Label htmlFor="codechef">CodeChef</Label>
                          </div>
                          <Input
                            id="codechef"
                            placeholder="https://www.codechef.com/users/yourusername"
                            value={profileLinks.codechef}
                            onChange={(e) =>
                              setProfileLinks({
                                ...profileLinks,
                                codechef: e.target.value,
                              })
                            }
                            required
                          />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <Terminal className="w-5 h-5 text-gray-500" />
                        <Label htmlFor="codeforces">Codeforces</Label>
                          </div>
                          <Input
                            id="codeforces"
                            placeholder="https://codeforces.com/profile/yourusername"
                            value={profileLinks.codeforces}
                            onChange={(e) =>
                              setProfileLinks({
                                ...profileLinks,
                                codeforces: e.target.value,
                              })
                            }
                            required
                          />
                      </div>
                      <Button type="submit" className="w-full">
                        Submit Profile Links
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Mark Today's Attendance</CardTitle>
              <CardDescription>
                {isMounted && currentTime
                  ? new Date(currentTime).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Loading..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-lg shadow">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-lg font-semibold">Current Time</p>
                    {isMounted ? (
                      <p className="text-2xl">
                        {format(currentTime, "HH:mm:ss")}
                      </p>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                </div>
                {isAttendanceWindowOpen ? (
                  attendanceMarked ? (
                    <div className="text-green-600 font-semibold flex items-center">
                      <CheckCircle className="mr-2" />
                      Attendance Marked
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      {windowOpen ? (
                        <Button
                          onClick={markAttendance}
                          // disabled={!isPresent}
                          size="lg"
                          className="px-8 mb-2"
                        >
                          Mark Attendance
                        </Button>
                      ) : (
                        <div className="text-red-600 font-semibold flex items-center">
                          <AlertTriangle className="mr-2" />
                          Attendance Window Closed
                        </div>
                      )}
                      {/* <p className="text-sm text-gray-500">
                      Time left: {timeLeftInMinutes} minute
                      {timeLeftInMinutes !== 1 ? "s" : ""}
                    </p> */}
                    </div>
                  )
                ) : null}
              </div>
            </CardContent>
          </Card>
          {/* <TabsContent value="submitted"> */}
          {/* </TabsContent> */}
        </div>
        <div className="mt-8 w-full">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Submitted Projects
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Explore the collection of projects you have successfully
              submitted.
            </p>
            <div className="flex justify-center">
              <div className="w-1/3 h-1 rounded bg-gradient-to-r from-blue-500 to-indigo-600 mb-4"></div>
            </div>
          </div>
          <div className="flex w-full flex-col md:flex-row md:flex-wrap md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {submittedProjects.length > 0 ? (
              <SubmittedProjects submittedProjects={submittedProjects} />
            ) : <SkeletonSubmitted />
            }
          </div>
        </div>
        <Card className="lg:col-span-3 mt-10">
          <CardHeader>
            <CardTitle>Attendance Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important Notice</AlertTitle>
              <AlertDescription>
                The attendance marking window is open for 10 minutes each day.
                Please ensure you mark your attendance within this timeframe. If
                you miss the window, please contact your administrator.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
