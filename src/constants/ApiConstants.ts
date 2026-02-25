//  ENVIRONMENTS :  LOCAL, DEVELOPMENT,STAGE, PRODUCTION
const ENV: string = "PRODUCTION";

let baseUrl;

switch (ENV) {
  case "LOCAL":
    baseUrl = "http://localhost:4000";
    break;
  case "DEVELOPMENT":
    baseUrl = "https://dev-api.skillstrideacademy.in";
    break;
  case "STAGE":
    baseUrl = "https://stage-api.skillstrideacademy.in";
    break;
  case "PRODUCTION":
    baseUrl = "https://skillstridemainapis-wxt2u.ondigitalocean.app";
    break;
  default:
    baseUrl = "http://localhost:4000";
}

//AUTH APIS
export const LOGIN = `${baseUrl}/auth/public/admin-login`; // POST
export const VERIFY_OTP = `${baseUrl}/auth/public/admin-login-verify`; //POST
export const REFRESH_TOKEN = `${baseUrl}/auth/refresh`; // POST

// ADMINS
export const CREATE_ADMIN = `${baseUrl}/role/add`; // POST
export const GET_ALL_ADMINS = `${baseUrl}/role/get-all`; // GET
export const DELETE_ADMIN = `${baseUrl}/admin/delete-admin`; // POST
export const UPDATE_ADMIN = `${baseUrl}/role/update`; // POST
export const EDIT_ADMIN = `${baseUrl}/role/edit`; // POST
export const GET_ADMIN_DETAILS = `${baseUrl}/role/get`; // GET
export const RESEND_INVITATION = `${baseUrl}/role/resend-invite`; //POST

// CITIES
export const GET_ALL_CITIES = `${baseUrl}/cities/get`; // GET
export const DELETE_CITY = `${baseUrl}/cities/delete`; // DELETE
export const CREATE_CITY = `${baseUrl}/cities/add`; // POST
export const UPDATE_CITY = `${baseUrl}/cities/update`; // PATCH

//  JOB_CATEGORIES
export const GET_ALL_JOB_CATEGORIES = `${baseUrl}/job-category/get`; // GET
export const DELETE_JOB_CATEGORY = `${baseUrl}/job-category/delete`; // DELETE
export const CREATE_JOB_CATEGORY = `${baseUrl}/job-category/add`; // POST
export const UPDATE_JOB_CATEGORY = `${baseUrl}/job-category/update`; // PATCH

// JOBS
export const GET_ALL_JOBS = `${baseUrl}/job/get`; // GET
export const DELETE_JOB = `${baseUrl}/job/delete`; // DELETE
export const CREATE_JOB = `${baseUrl}/job/add`; // POST
export const UPDATE_JOB = `${baseUrl}/job/update`; // PATCH
export const GET_JOB_BY_ID = `${baseUrl}/job/get`; // GET
export const GET_APPLIED_LIST_BY_JOBID = `${baseUrl}/jobs-applied`; // GET
export const UPDATE_JOB_APPLIED_STATUS = `${baseUrl}/jobs-applied/status`; // PATCH
export const GET_ALL_APPLICATIONS = `${baseUrl}/jobs-applied/applications` // GET
export const UPDATE_JOB_STATUS = `${baseUrl}/job/toggle-status` // PATCH

// ADS
export const GET_ALL_ADS = `${baseUrl}/ads/get`; // GET
export const UPDATE_STATUS = `${baseUrl}/ads/update`; // POST
export const DELETE_AD = `${baseUrl}/ads`; // DELETE
export const CREATE_NEW_AD = `${baseUrl}/ads/create`; // POST
export const GET_AVAILABLE_POSITIONS = `${baseUrl}/ads/get-slots`; // GET

// UPLOAD
export const UPLOAD_IMAGE = `${baseUrl}/upload_files`; // POST

//COMPANIES
export const GET_ALL_COMPANIES = `${baseUrl}/company/get-all`; // GET
export const UPDATE_COMPANY = `${baseUrl}/company/update`; // POST
export const ADD_COMPANY = `${baseUrl}/company/add`; // POST
export const EDIT_COMPANY = `${baseUrl}/company/edit`; // POST
export const RESEND_INVITATION_FOR_COMPANY = `${baseUrl}/company/resend-invite`; // POST

// INVITATION
export const VERIFY_INVITATION = `${baseUrl}/auth/public/verify-invitation`;

//COURSES
export const GET_ALL_COURSES = `${baseUrl}/courses/get`; // GET
export const UPDATE_COURSE = `${baseUrl}/courses/update`; // PATCH
export const DELETE_COURSE = `${baseUrl}/courses/delete`; // DELETE
export const CREATE_COURSE = `${baseUrl}/courses/add`; // POST
export const GET_COURSE_BY_ID = `${baseUrl}/courses/get`; // GET
export const PUBLISH_COURSE = `${baseUrl}/courses/publish`; // PATCH
export const UPDATE_COURSE_STATUS = `${baseUrl}/courses/toggle-lock` // PATCH
export const GET_COURSE_PRICE = `${baseUrl}/courses` // GET
export const UPDATE_COURSE_PRICES = `${baseUrl}/courses/admin` //PATCH

//CREDITS
export const GET_ALL_CREDITS = `${baseUrl}/credits/get-all`; // GET
export const DELETE_CREDIT = `${baseUrl}/credits/delete`; // DELETE
export const UPDATE_CREDIT = `${baseUrl}/credits/update`; // PATCH
export const CREATE_CREDIT = `${baseUrl}/credits/add`; // POST
export const GET_CUSTOM_CREDITS = `${baseUrl}/credits/custom/get` // GET
export const CREATE_CUSTOM_CREDIT = `${baseUrl}/credits/custom/create` //POST
export const UPDATE_CUSTOM_CREDIT = `${baseUrl}/credits/custom/update` // PATCh

// NOTIFICATIONS
export const GET_ALL_NOTIFICATIONS = `${baseUrl}/notifications/all`; // GET
export const CREATE_NOTIFICATION = `${baseUrl}/notifications/create`; // POST
export const RESEND_NOTIFICATION = `${baseUrl}/notifications/resend`; // POST

// COURSE CATEGORIES
export const GET_ALL_COURSE_CATEGORIES = `${baseUrl}/courses/categories`; // GET
export const CREATE_COURSE_CATEGORY = `${baseUrl}/courses/categories`; // POST
export const UPDATE_COURSE_CATEGORY = `${baseUrl}/courses/categories`; // PATCH
export const DELETE_COURSE_CATEGORY = `${baseUrl}/courses/categories`; // DELETE

//LESSIONS
export const GET_ALL_LESSIONS = `${baseUrl}/lessons/get`; // GET
export const DELETE_LESSION = `${baseUrl}/lessons/delete`; // DELETE
export const UPDATE_LESSION = `${baseUrl}/lessons/update`; // PATCH
export const CREATE_LESSION = `${baseUrl}/lessons/add`; // POST
export const UPDATE_LESSON_STATUS = `${baseUrl}/lessons/toggle-lock`; // PATCH

// FEEDBACK
export const GET_FEEDBACK_BY_COURSE = `${baseUrl}/feedback/get`; // GET

// COURSE_MATERIALS
export const GET_COURSE_MATERIALS_BY_COURSE = `${baseUrl}/course-materials/get`; // GET
export const DELETE_COURSE_MATERIAL = `${baseUrl}/course-materials/delete`; // DELETE
export const CREATE_COURSE_MATERIAL = `${baseUrl}/course-materials/add`; // POST

// LESSION_VIDEOS
export const CREATE_LESSON_VIDEO = `${baseUrl}/lesson-videos/add`; // POST
export const GET_LESSON_VIDEOS = `${baseUrl}/lesson-videos/get`; // GET
export const UPDATE_LESSON_VIDEO = `${baseUrl}/lesson-videos/update`; // PATCH
export const DELETE_LESSON_VIDEO = `${baseUrl}/lesson-videos/delete`; // DELETE
export const GET_VIDEO_BY_ID = `${baseUrl}/lesson-videos/get`; // GET
export const UPDATE_LESSON_VIDEO_STATUS = `${baseUrl}/lesson-videos/toggle-lock`; // PATCH

// SUBSCRIPTIONS
export const GET_SUBSCRIPTIONS_PLANS = `${baseUrl}/payment/get-plans`; // GET
export const UPDATE_SUBSCRIPTION_PLAN = `${baseUrl}/payment/update-plan`; // POST

// SPIN WHEEL
export const GET_SPIN_WHEEL = `${baseUrl}/spin-wheel/get`; // GET
export const UPDATE_SPIN_WHEEL_ITEM = `${baseUrl}/spin-wheel/update`; // POST
export const GET_SPIN_WHEEL_CONFIGURATION = `${baseUrl}/spin-wheel/admin/config`; // GET
export const UPDATE_SPIN_WHEEL_CONFIGURATION = `${baseUrl}/spin-wheel/admin/config`; // POST

// PAYMENTS
export const GET_PAYMENTS = `${baseUrl}/payment/all`; // GET

// DASHBOARD
export const GET_STATS = `${baseUrl}/stats/`; // GET

// PROFILE
export const GET_ADMIN_PROFILE = `${baseUrl}/auth/admin/get-profile`; // GET
export const UPDATE_ADMIN_PROFILE = `${baseUrl}/auth/admin/update-profile`; // POST

// USERS
export const GET_ALL_USERS = `${baseUrl}/user-app/admin/get-user-details` // GET
export const DELETE_USER = `${baseUrl}/user-app/admin/delete-user` // POST

// ORGANIZATIONS
export const GET_ALL_ORGANIZATIONS = `${baseUrl}/organizations` // GET
export const GET_ORGANIZATION_BY_ID = `${baseUrl}/organizations` // GET
export const UPDATE_ORGANIZATION = `${baseUrl}/organizations` // PUT
export const DELETE_ORGANIZATION = `${baseUrl}/organizations` // DELETE
export const CREATE_ORGANIZATION = `${baseUrl}/organizations/create` // POST
export const GET_ORGANIZATION_SUBSCRIPTION_DETAILS = `${baseUrl}/organizations` // GET
export const UPDATE_ORGANIZATION_SUBSCRIPTION = `${baseUrl}/organizations` // POST

// ORGANIZATION SEATS
export const SEATS_API = `${baseUrl}/organizations` // ALL


// EXPORTS 
export const GET_ALL_EXPORTS = `${baseUrl}/exports/my` // GET
export const DELETE_EXPORT_FILE = `${baseUrl}/exports` // PATCH
export const INTIATE_EXPORT = `${baseUrl}/exports/initiate` // POST
