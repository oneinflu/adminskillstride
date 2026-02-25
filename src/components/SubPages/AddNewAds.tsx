import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { ROUTES } from "../../constants/RouteConstants";
import { BackendService } from "../../Utils/Backend";
import {
  GET_AVAILABLE_POSITIONS,
  CREATE_NEW_AD,
  GET_ALL_COURSES,
} from "../../constants/ApiConstants";
import { useSelector } from "react-redux";
import { Icons } from "../icons";
import { toast } from "react-toastify";
import { imageUpload } from "../ImageUpload";

interface FormValues {
  type: string;
  start_date: string;
  end_date: string;
  slot: number;
  course_id: string;
  adType: string;
  redirect_link?: string;
}

const AddNewAds: React.FC = () => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const navigate = useNavigate();

  const [availablePositions, setAvailablePositions] = useState<number[]>([]);
  const [image, setImage] = useState<any>(null);
  const [landscapeImage, setLandscapeImage] = useState<any>(null);
  const [loadingPositions, setLoadingPositions] = useState<boolean>(false);
  const [isPositionDisabled, setIsPositionDisabled] = useState<boolean>(true);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB in bytes

    if (file.size > MAX_SIZE) {
      toast.error("File size must be less than 20MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    const img = new Image();

    reader.onload = (event) => {
      if (!event.target?.result) return;

      img.src = event.target.result as string;

      img.onload = () => {
        const { width, height } = img;

        if (width !== 340 || height !== 429) {
          toast.error("Image must be exactly 429px height and 340px width");
          e.target.value = "";
          return;
        }
        setImage(file);
      };
    };

    reader.readAsDataURL(file);
  };
  const handleLanscapeImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB in bytes

    if (file.size > MAX_SIZE) {
      toast.error("File size must be less than 20MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    const img = new Image();

    reader.onload = (event) => {
      if (!event.target?.result) return;

      img.src = event.target.result as string;

      img.onload = () => {
        const { width, height } = img;
        console.log(width, height)

        if (width !== 813 || height !== 462) {
          toast.error("Image must be exactly 813px height and 462px width");
          e.target.value = "";
          return;
        }
        setLandscapeImage(file);
      };
    };

    reader.readAsDataURL(file);
  };

  const validationSchema = Yup.object().shape({
    start_date: Yup.string().required("Start Date is required"),
    end_date: Yup.string().required("End Date is required"),
    slot: Yup.string().required("Position is required"),
    adType: Yup.string().required("Ad type is required"),
    course_id: Yup.string().when("adType", {
      is: "COURSE",
      then: (schema) => schema.required("Course is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    redirect_link: Yup.string().when("adType", {
      is: "WEBSITE",
      then: (schema) =>
        schema
          .required("Redirect link is required")
          .url("Enter a valid URL (https://example.com)"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      course_id: "",
      start_date: "",
      end_date: "",
      slot: 0,
      type: "",
      adType: "COURSE",
      redirect_link: "",
    },
    validationSchema,
    onSubmit: (values: FormValues) => createNewAd(values),
  });

  // 🔹 Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        await BackendService.Get(
          {
            url: `${GET_ALL_COURSES}?page=1&limit=30&search=${searchText}`,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              const courseOptions = (response?.courses || []).map((c) => ({
                value: c._id,
                label: c.name,
              }));
              setFilteredCourses(courseOptions);
              setLoadingCourses(false);
            },
            failure: () => {
              toast.error("Failed to load courses");
              setLoadingCourses(false);
            },
          }
        );
      } catch {
        toast.error("Something went wrong while loading courses");
        setLoadingCourses(false);
      }
    };

    if (formik.values.adType === "COURSE") fetchCourses();
  }, [admintoken, searchText, formik.values.adType]);

  // 🔹 Create Ad
  const createNewAd = async (values: FormValues) => {
    setSubmitLoading(true);
    if (!image) {
      toast.error("Please upload an image for banner ads.");
      setSubmitLoading(false);
      return;
    }
    let imageUrl: string | null = null;
    if (image) {
      if (typeof image === "string") {
        // already uploaded (editing, unchanged)
        imageUrl = image;
      } else {
        // it's a File object → upload it
        imageUrl = await imageUpload(image, "Thumbnail", admintoken);
        if (!imageUrl) {
          setSubmitLoading(false);
          return; // stop if upload failed
        }
      }
    }
    let landscapeImageUrl: string | null = null;
    if (landscapeImage) {
      if (typeof landscapeImage === "string") {
        // already uploaded (editing, unchanged)
        landscapeImageUrl = landscapeImage;
      } else {
        // it's a File object → upload it
        landscapeImageUrl = await imageUpload(landscapeImage, "Thumbnail", admintoken);
        if (!imageUrl) {
          setSubmitLoading(false);
          return; // stop if upload failed
        }
      }
    }
    try {
      const payload =
        values.adType === "COURSE"
          ? {
              start_date: values.start_date,
              end_date: values.end_date,
              slot: Number(values.slot),
              course_id: values.course_id,
              type: values.adType,
              thumbnail: imageUrl,
              landscapeThumbnail: landscapeImageUrl
            }
          : {
              start_date: values.start_date,
              end_date: values.end_date,
              slot: Number(values.slot),
              web_link: values.redirect_link,
              type: values.adType,
              thumbnail: imageUrl,
              landscapeThumbnail : landscapeImageUrl
            };

      await BackendService.Post(
        {
          url: CREATE_NEW_AD,
          accessToken: admintoken,
          data: payload,
        },
        {
          success: () => {
            toast.success("Ad created successfully");
            navigate(ROUTES.ADVERTISEMENT);
            setSubmitLoading(false);
          },
          failure: (err) => {
            toast.error(err?.response?.data?.message || "Failed to create ad");
            setSubmitLoading(false);
          },
        }
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitLoading(false);
    }
  };

  // 🔹 Fetch Available Positions
  const fetchAvailablePositions = async (start_date, end_date) => {
    const startDate = new Date(start_date).toISOString();
    const endDate = new Date(end_date).toISOString();

    if (endDate < startDate) {
      toast.error("End date cannot be earlier than the start date!");
      return;
    }

    setLoadingPositions(true);
    setIsPositionDisabled(true);

    try {
      await BackendService.Get(
        {
          url: `${GET_AVAILABLE_POSITIONS}?start_date=${startDate}&end_date=${endDate}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setAvailablePositions(response);
            setLoadingPositions(false);
            setIsPositionDisabled(false);
          },
          failure: () => {
            toast.error("Failed to get available positions!");
            setLoadingPositions(false);
          },
        }
      );
    } catch {
      toast.error("Something went wrong while getting positions");
      setLoadingPositions(false);
      setIsPositionDisabled(false);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = async (
    date: Date | null,
    field: "start_date" | "end_date"
  ) => {
    if (date) {
      const formattedDate = formatDate(date);
      formik.setFieldValue(field, formattedDate);

      const { start_date, end_date } = {
        start_date:
          field === "start_date" ? formattedDate : formik.values.start_date,
        end_date: field === "end_date" ? formattedDate : formik.values.end_date,
      };

      if (start_date && end_date && start_date <= end_date) {
        await fetchAvailablePositions(start_date, end_date);
      }
    }
  };

  return (
    <div className="p-6">
      <p className="text-2xl font-medium text-gray-900 pb-0">Add New Ads</p>
      <form onSubmit={formik.handleSubmit}>
        <div className="w-full border border-gray-300 rounded-md flex flex-col gap-3 p-4">
          {/* 🔹 Ad Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">Ad Type</label>
            <select
              name="adType"
              value={formik.values.adType}
              onChange={formik.handleChange}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="COURSE">Course</option>
              <option value="WEBSITE">Wesite</option>
            </select>
          </div>

          {/* 🔹 Conditional: Course or Redirect Link */}
          {formik.values.adType === "COURSE" ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">
                Select Course
              </label>
              <Select
                options={filteredCourses}
                isLoading={loadingCourses}
                value={filteredCourses.find(
                  (opt) => opt.value === formik.values.course_id
                )}
                onInputChange={(inputValue) => setSearchText(inputValue)}
                onChange={(option) =>
                  formik.setFieldValue("course_id", option?.value)
                }
                placeholder="Search and select course..."
              />
              {formik.errors.course_id && formik.touched.course_id && (
                <p className="text-red-500 text-sm">
                  {formik.errors.course_id}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">
                Redirect Link
              </label>
              <input
                type="text"
                name="redirect_link"
                placeholder="https://example.com"
                value={formik.values.redirect_link}
                onChange={formik.handleChange}
                className="border border-gray-300 rounded-md p-2"
              />
              {formik.errors.redirect_link && formik.touched.redirect_link && (
                <p className="text-red-500 text-sm">
                  {formik.errors.redirect_link}
                </p>
              )}
            </div>
          )}

          {/* 🔹 Dates */}
          <div className="flex gap-2">
            <div className="w-1/2 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">
                Start Date
              </label>
              <DatePicker
                selected={
                  formik.values.start_date
                    ? new Date(formik.values.start_date)
                    : null
                }
                onChange={(date: Date | null) =>
                  handleDateChange(date, "start_date")
                }
                dateFormat="dd-MM-yyyy"
                placeholderText="Select Start Date"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="w-1/2 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">
                End Date
              </label>
              <DatePicker
                selected={
                  formik.values.end_date
                    ? new Date(formik.values.end_date)
                    : null
                }
                onChange={(date: Date | null) =>
                  handleDateChange(date, "end_date")
                }
                dateFormat="dd-MM-yyyy"
                placeholderText="Select End Date"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          {/* 🔹 Position */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">
              Position
            </label>
            <select
              name="slot"
              value={formik.values.slot}
              onChange={formik.handleChange}
              disabled={isPositionDisabled}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="">
                {loadingPositions
                  ? "Loading positions..."
                  : "Select a position"}
              </option>
              {availablePositions?.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="space-y-2 w-1/3">
              {!image ? (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 transition"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16V4a4 4 0 014-4h2a4 4 0 014 4v12m-4 0v4m0 0H9m4 0h2"
                      ></path>
                    </svg>
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 1MB</p>
                    <p className="text-xs text-gray-400">
                      Required image size: 429px (H) × 340px (W)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="relative w-full h-40 border rounded overflow-hidden group">
                  <img
                    src={
                      typeof image === "string"
                        ? image
                        : URL.createObjectURL(image)
                    }
                    alt="Uploaded"
                    className="object-cover w-full h-full transition-opacity"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2 w-1/3">
              {!landscapeImage ? (
                <label
                  htmlFor="landscapeImage-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 transition"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16V4a4 4 0 014-4h2a4 4 0 014 4v12m-4 0v4m0 0H9m4 0h2"
                      ></path>
                    </svg>
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 20MB</p>
                    <p className="text-xs text-gray-400">Required image size: 462px (H) × 813px (W)</p>
                  </div>
                  <input
                    id="landscapeImage-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLanscapeImageUpload}
                  />
                </label>
              ) : (
                <div className="relative w-full h-40 border rounded overflow-hidden group">
                  <img
                    src={
                      typeof landscapeImage === "string"
                        ? landscapeImage
                        : URL.createObjectURL(landscapeImage)
                    }
                    alt="Uploaded"
                    className="object-cover w-full h-full transition-opacity"
                  />
                  <button
                    type="button"
                    onClick={() => setLandscapeImage(undefined)}
                    className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 🔹 Buttons */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADVERTISEMENT)}
              className="p-2 bg-white text-black rounded-lg border-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 bg-gray-900 text-white rounded-md"
            >
              {submitLoading ? <Icons.loading /> : "Add Ad"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewAds;
