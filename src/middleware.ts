export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        "/",
        "/chatText/:path*",
        "/userSetting/:path*",
        "/workers/:path*",
        "/changeLog/:path*",
        "/explorer/:path*",
        "/roboChat/:path*",
        "/router/:path*",
        "/subscription/:path*",
        "/api/chat/:path*",
        "/api/innovation/:path*",
        "/api/intelligence/:path*",
        "/api/marketing/:path*",
        "/api/user/:path*",
    ]
}