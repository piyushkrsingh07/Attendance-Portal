"use client"
// import SignupFormDemo from "./signin/page";

import { useSession } from "next-auth/react";
import EnhancedStudentDashboard from "./components/students/studentDashboard";
// import EnhancedRegistrationForm from "./signup/page";


export default function Home() {

  const {data : session} = useSession();

  // console.log(session,"wwedwedd")

  return (
    <div className="">
      {/* <EnhancedRegistrationForm/> */}
      <EnhancedStudentDashboard />
    </div>
  );
}
