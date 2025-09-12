import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export { default } from "next-auth/middleware";
// export { auth as middleware } from "@/auth"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  
  const url = request.nextUrl;
//   console.log("dekho token see",token)
// console.log(token,"hello")

  const isAdmin : string | undefined = token ? (token as { role: string }).role : undefined;

  if (token && url.pathname.startsWith("/signin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // if (!token && url.pathname !== "/signin") {
  //   return NextResponse.redirect(new URL("/signin", request.url));
  // }

  if (!token && url.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && url.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

 // Redirect non-admin users trying to access admin routes
  if (isAdmin !== "admin" && url.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url)); // Or redirect to a not-authorized page
  }

//   if (url.pathname.startsWith("/signup")) {
//     return NextResponse.redirect(new URL("/signup", request.url));
//   }  

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin","/admin","/signup"]
};
