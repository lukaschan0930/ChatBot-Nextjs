export { default } from "next-auth/middleware"

export const config = { matcher: ["/", "/chatText/:path*", "/userSetting/:path*", "/workers/:path*", "/changeLog/:path*"] }