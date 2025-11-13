"use client"
// import SignupFormDemo from "./signin/page";


import { useSession } from "next-auth/react";
import EnhancedStudentDashboard from "./components/students/studentDashboard";
import SignupFormDemo from "./signin/page";
import EnhancedRegistrationForm from "./signup/page";
import PortalClosed from "./components/closed";


export default function Home() {

  const {data : session} = useSession();

  // console.log(session,"wwedwedd")

  return (
    <div className="">
      {/* <EnhancedRegistrationForm/> */}
      {/* <SignupFormDemo/> */}
      <PortalClosed/>
      {/* <EnhancedStudentDashboard/>                                       */}
    </div>
  );
}
