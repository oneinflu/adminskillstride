import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DefaultLayout";
import { ROUTES } from "./constants/RouteConstants";
import ProtectedLayer from "./layers/Protected";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubAdminManagement from "./pages/SubAdminManagement";
import ProtectedRoute from "./layers/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
import Subscriptions from "./pages/Subscriptions";
import PublicLayer from "./layers/Public";
import Login from "./components/Login";
import VerifyOtp from "./components/VerifyOtp";
import Jobs from "./pages/Jobs mangement";
import Categories from "./pages/CourseCategories";
import CreditsTable from "./pages/Credits";
import JobCategories from "./pages/JobCategories";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Companies from "./pages/Companies";
import Cities from "./pages/Cities";
import Users from "./pages/Users";
import Courses from "./pages/Courses";
import AdsManagement from "./pages/Ads Management";
import VerifyInvitation from "./components/VeirfyInvitation";
import AddNewAds from "./components/SubPages/AddNewAds";
import CourseDetails from "./components/SubPages/CourseDetailsPage";
import LessonDetails from "./components/SubPages/LessonDetails";
import SpinWheel from "./pages/SpinWheel Management";
import PaymentsPage from "./pages/Payments";
import JobApplications from "./components/SubPages/JobApplications";
import NotFound from "./components/NotFound";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import Organizations from "./pages/Organizations";
import OrganizationDetails from "./components/SubPages/OrganizationDetails";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
      <Routes>
        <Route element={<PublicLayer />}>
          <Route path={ROUTES.LOGIN} element={<Login />} />
        </Route>
        <Route element={<PublicLayer />}>
          <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtp />} />
        </Route>
        <Route element={<PublicLayer />}>
          <Route path={ROUTES.AUTHENTICATION} element={<VerifyInvitation />} />
        </Route>
        <Route element={<ProtectedLayer />}>
          <Route
            path={ROUTES.HOME}
            element={<Navigate to={ROUTES.DASHBOARD} />}
          />
          <Route
            path={ROUTES.UNAUTHORIZED}
            element={
              <DashboardLayout>
                <Unauthorized />
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Dashboard">
                  <Dashboard />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <DashboardLayout>
                <ProtectedRoute module="profile">
                  <Profile />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.ADVERTISEMENT}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Ads Management">
                  <AdsManagement />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.CATEGORIES}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Course Categories">
                  <Categories />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.CITY_MANAGEMENT}
            element={
              <DashboardLayout>
                <ProtectedRoute module="City Management">
                  <Cities />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.ORGANIZATIONS}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Organizations">
                  <Organizations />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
                    <Route
            path={ROUTES.ORGANIZATION_DETAILS}
            element={
              <ProtectedRoute module="Organizations">
                <DashboardLayout>
                  <OrganizationDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.USERS}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Users">
                  <Users />
                </ProtectedRoute>
              </DashboardLayout>
            }
          /> 
          <Route
            path={ROUTES.NOTIFIICATIONS}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Notifications">
                  <Notifications />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.COMPANIES}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Companies">
                  <Companies />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.COURSES}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Courses">
                  <Courses />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.JOB_CATEGORIES}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Job Categories">
                  <JobCategories />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.SUBSCRIPTIONS}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Subscriptions">
                  <Subscriptions />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.CREDITS}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Credits">
                  <CreditsTable />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.JOB_APPLICATIONS}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Jobs Management">
                  <JobApplications />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.JOBS}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Jobs Management">
                  <Jobs />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.ADD_NEW_ADS}
            element={
              <ProtectedRoute module="Ads Management">
                <DashboardLayout>
                  <AddNewAds />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.COURSE_DETAILS}
            element={
              <ProtectedRoute module="Courses">
                <DashboardLayout>
                  <CourseDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.LESSION_DETAILS}
            element={
              <ProtectedRoute module="Courses">
                <DashboardLayout>
                  <LessonDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PAYMENTS}
            element={
              <ProtectedRoute module="payments">
                <DashboardLayout>
                  <PaymentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SUBADMIN_MANAGEMENT}
            element={
              <DashboardLayout>
                <ProtectedRoute module="SUPER_ADMIN">
                  <SubAdminManagement />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
          <Route
            path={ROUTES.SPIN_WHEEL}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Spin Wheel">
                  <SpinWheel />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
                    <Route
            path={ROUTES.APPLICATIONS}
            element={
              <DashboardLayout>
                <ProtectedRoute module="Applications">
                  <Applications />
                </ProtectedRoute>
              </DashboardLayout>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
