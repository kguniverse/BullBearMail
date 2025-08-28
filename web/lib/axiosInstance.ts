import axios from "axios";
import { getSession } from "next-auth/react";

// 创建 axios 实例
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DJANGO_API_URL + "/api/",
  timeout: 10000,
});

// 请求拦截器，自动添加 next-auth 的 access token
instance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session && (session as any).access) {
      config.headers["Authorization"] = `Bearer ${(session as any).access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器，token 过期或未登录时跳转到登录页面
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;