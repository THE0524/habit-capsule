// app/index.js
import { Redirect } from 'expo-router';

export default function Index() {
  // 重定向到标签页的今日页面
  return <Redirect href="/(tabs)" />;
}