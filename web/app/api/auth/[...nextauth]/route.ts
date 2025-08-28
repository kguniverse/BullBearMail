import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "username", type: "text" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials) {
                // Call Django backend login API
                try {
                    const res = await axios.post(
                        process.env.NEXT_PUBLIC_DJANGO_API_URL + "/api/auth/login/",
                        {
                            username: credentials?.username,
                            password: credentials?.password,
                        }
                    );
                    if (res.data && res.data.access && res.data.refresh) {
                        // 返回用户信息和 access/refresh token
                        console.log("login:", res.data);
                        return {
                            id: res.data.user.id,
                            name: res.data.user.username,
                            access: res.data.access,
                            refresh: res.data.refresh,
                        };
                    }
                    return null;
                } catch {
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login", // Redirect page when not logged in
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            // 登录时保存 access 和 refresh token
            if (user) {
                token.access = (user as any).access;
                token.refresh = (user as any).refresh;
            }

            // 检查 access token 是否过期，过期则用 refresh token 自动刷新
            if (token.access && token.refresh) {
                // 解析 JWT，获取过期时间
                const decodeJwt = (jwt: string) => {
                    try {
                        return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
                    } catch {
                        return null;
                    }
                };
                const accessPayload = typeof token.access === "string" ? decodeJwt(token.access) : null;
                const now = Math.floor(Date.now() / 1000);
                if (accessPayload && accessPayload.exp && accessPayload.exp < now) {
                    try {
                        const refreshRes = await axios.post(
                            process.env.NEXT_PUBLIC_DJANGO_API_URL + "/api/auth/refresh/",
                            { refresh: token.refresh }
                        );
                        if (refreshRes.data && refreshRes.data.access) {
                            token.access = refreshRes.data.access;
                        } else {
                            // 刷新失败，清除 token
                            token.access = undefined;
                            token.refresh = undefined;
                        }
                    } catch {
                        token.access = undefined;
                        token.refresh = undefined;
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            // 类型断言，告诉 TypeScript session 可以有 access 和 refresh 字段
            (session as any).access = token.access;
            (session as any).refresh = token.refresh;
            return session;
        },
    },
});

export { handler as GET, handler as POST };