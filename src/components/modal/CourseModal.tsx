import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BackendService } from "../../Utils/Backend";
import {
  GET_ALL_COURSE_CATEGORIES,
  GET_COURSE_BY_ID,
  UPDATE_COURSE,
  CREATE_COURSE,
} from "../../constants/ApiConstants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icons } from "../icons";
import { imageUpload } from "../ImageUpload";

interface AdminModalProps {
  onClose: () => void;
  course?: any;
  onSubmit: () => void;
}

const CourseModal: React.FC<AdminModalProps> = ({
  onClose,
  course,
  onSubmit,
}) => {
  const [image, setImage] = useState<any>(course?.image || null);
  const [landscapeImage, setLandscapeImage] = useState<any>(course?.landscapeImage || null);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    image: "",
    level: "",
    description: "",
  });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        await BackendService.Get(
          {
            url: `${GET_COURSE_BY_ID}/${course?._id}`,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              setForm({
                name: response?.name || "",
                level: response?.level || "",
                image: response?.image || "",
                description: response?.description || "",
              });

              setSelectedCategory(response?.category?._id);
            },
            failure: async (response) => {
              toast.error(response?.data?.message);
              setLoading(false);
            },
          }
        );
      } catch (error) {
        setLoading(false);
        toast.error("Error fetching course details:", error);
      }
    };

    if (course?._id) {
      fetchCourseDetails();
    }
  }, [course]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        await BackendService.Get(
          {
            url: `${GET_ALL_COURSE_CATEGORIES}?page=1&limit=100`,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              setCategories(response);
            },
            failure: async (response) => {
              toast.error(response?.data?.message);
              setLoading(false);
            },
          }
        );
      } catch (error) {
        setLoading(false);
        console.error("Error fetching admin details:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

        if (width !== 106 || height !== 152) {
          toast.error("Image must be exactly 152px height and 106px width");
          e.target.value = "";
          return;
        }
        setImage(file);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleLandscapeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 20 * 1024 * 1024;

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

        if (width !== 152 || height !== 106) {
          toast.error("Image must be exactly 106px height and 152px width");
          e.target.value = "";
          return;
        }
        setLandscapeImage(file);
      };
    };

    reader.readAsDataURL(file);
  };

  console.log(selectedCategory);

  const handleCourse = async () => {
    if (!form.name?.trim()) {
      toast.error("Course name is required.");
      return;
    }
    if (form.name.trim().length < 3) {
      toast.error("Course name must be at least 3 characters long.");
      return;
    }
    if (form.name.trim().length > 40) {
      toast.error("Course name cannot exceed 40 characters.");
      return;
    }

    if (!form?.level.trim() && !course?._id) {
      toast.error("Course Level is required.");
      return;
    }

    if (!image) {
      toast.error("Course thumbnail is required.");
      return;
    }
    if (!landscapeImage) {
      toast.error("Course Landscape thumbnail is required.");
      return;
    }

    if (!selectedCategory && !course?._id) {
      toast.error("Please select a course category.");
      return;
    }

    if (!form.description?.trim()) {
      toast.error("Course description is required.");
      return;
    }
    if (form.description.trim().length < 3) {
      toast.error("Course description must be at least 3 characters long.");
      return;
    }
    if (form.description.trim().length > 200) {
      toast.error("Course description cannot exceed 200 characters.");
      return;
    }

    setLoading(true);
    const isEdit = course?._id;

    try {
      let uploadedImageUrl = course?.image; // default to existing image
      let uploadedLandscpeImageUrl = course?.landscapeImage; 

      // Only upload if user selected a new File
      if (image && typeof image !== "string") {
        uploadedImageUrl = await imageUpload(image, "Thumbnail", admintoken);
      }

      if (landscapeImage && typeof landscapeImage !== "string") {
        uploadedLandscpeImageUrl = await imageUpload(landscapeImage, "Thumbnail", admintoken);
      }

      const payload = isEdit
        ? {
            name: form.name,
            image: uploadedImageUrl,
            landscapeImage: uploadedLandscpeImageUrl,
            category: selectedCategory,
            level: form.level,
            description: form.description,
          }
        : {
            ...form,
            category: selectedCategory,
            image: uploadedImageUrl,
            landscapeImage: uploadedLandscpeImageUrl,
          };

      let method = isEdit ? BackendService.Patch : BackendService.Post;

      await method(
        {
          url: isEdit ? `${UPDATE_COURSE}/${course?._id}` : CREATE_COURSE,
          data: payload,
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success(
              isEdit
                ? "Course updated successfully!"
                : "Course created successfully!"
            );
            onSubmit();
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                (isEdit
                  ? "Failed to update the course."
                  : "Failed to create the course.")
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {course ? "Edit Course" : "Create Course"}
          </h2>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="block mb-1 font-medium">Course Name</label>
            <input
              name="name"
              placeholder="Course Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="w-full flex flex-col">
            <label className="block mb-1 font-medium">Course Level</label>
            <select
              value={form.level}
              name="level"
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Level</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="col-span-2 flex flex-col">
            <label className="block mb-1 font-medium">Course Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select the Category</option>
              {categories?.courseCategories?.map((item) => (
                <option key={item?._id} value={item?._id}>
                  {item?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-full col-span-3 gap-3">
          <div className="space-y-2">
            <label className="block mb-1 font-medium text-gray-700 ">
              Course Description
            </label>
            <textarea
              name="description"
              placeholder="Enter course description..."
              value={form.description}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded min-h-[190px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              Upload Image:
            </label>
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
                  <p className="text-xs text-gray-400">PNG, JPG up to 20MB</p>
                  <p className="text-xs text-gray-400">Required image size: 152px (H) × 106px (W)</p>
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
              <div className="relative w-full h-48 border rounded overflow-hidden group">
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
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              Upload Landscape Image:
            </label>
            {!landscapeImage ? (
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
                  <p className="text-xs text-gray-400">PNG, JPG up to 20MB</p>
                  <p className="text-xs text-gray-400">Required image size: 106px (H) × 152px (W)</p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLandscapeImageUpload}
                />
              </label>
            ) : (
              <div className="relative w-full h-48 border rounded overflow-hidden group">
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
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleCourse}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white rounded"
          >
            {loading ? <Icons.loading /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
