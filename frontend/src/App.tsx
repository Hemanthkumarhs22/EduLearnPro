import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import CatalogPage from "./pages/CatalogPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import InstructorDashboardPage from "./pages/InstructorDashboardPage";
import CourseManagementPage from "./pages/CourseManagementPage";
import LessonManagementPage from "./pages/LessonManagementPage";
import LearningPage from "./pages/LearningPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="catalog/:courseId" element={<CourseDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />

        <Route element={<ProtectedRoute roles={["student", "instructor", "admin"]} />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["student", "admin"]} />}>
          <Route path="student" element={<StudentDashboardPage />} />
          <Route path="learn/:courseId" element={<LearningPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["instructor", "admin"]} />}>
          <Route path="instructor" element={<InstructorDashboardPage />} />
          <Route path="instructor/courses" element={<CourseManagementPage />} />
          <Route path="instructor/courses/:courseId/lessons" element={<LessonManagementPage />} />
        </Route>
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
