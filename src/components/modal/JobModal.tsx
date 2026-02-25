import React, { useState, useEffect } from "react";
import { BackendService } from "../../Utils/Backend";
import { useSelector } from "react-redux";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  GET_ALL_CITIES,
  GET_ALL_JOB_CATEGORIES,
  CREATE_JOB,
  UPDATE_JOB,
  GET_JOB_BY_ID,
  GET_ALL_COMPANIES,
} from "../../constants/ApiConstants";
import { toast } from "react-toastify";
import Select from "react-select";
import { imageUpload } from "../ImageUpload";
import { Icons } from "../icons";
import { X } from "lucide-react";

interface JobModalProps {
  onClose: () => void;
  editingData?: any;
  onSubmit: () => void;
}

const JobModal: React.FC<JobModalProps> = ({
  onClose,
  editingData,
  onSubmit,
}) => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [image, setImage] = useState<any>(editingData?.image || null);

  const [locations, setLocations] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    salaryMin: "",
    salaryMax: "",
    type: "",
    workMode: "",
    expMin: "",
    expMax: "",
    lat_date_to_apply: "",
    jobCategoryId: "",
    cityId: "",
    companyId: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const MAX_SIZE = 20 * 1024 * 1024;
  
    if (file.size > MAX_SIZE) {
      toast("File size must be less than 20MB");
      e.target.value = "";
      return;
    }
  
    const reader = new FileReader();
    reader.onload = () => {
      setImage(file);
    };
    reader.readAsDataURL(file);
  };
  

  useEffect(() => {
    if (!editingData?._id) return; // run only if editing

    const fetchData = async () => {
      try {
        await BackendService.Get(
          {
            url: `${GET_JOB_BY_ID}/${editingData._id}`,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              const job = response?.job;
              setForm({
                title: job?.title || "",
                description: job?.description || "",
                salaryMin: job?.salary?.min || "",
                salaryMax: job?.salary?.max || "",
                type: job?.type || "",
                workMode: job?.work_mode || "",
                expMin: job?.experience_level?.min || "0",
                expMax: job?.experience_level?.max || "",
                lat_date_to_apply: job?.lat_date_to_apply
                  ? job.lat_date_to_apply.split("T")[0]
                  : "",
                jobCategoryId: job?.job_category?._id || "",
                cityId: job?.city?._id || "",
                companyId: job?.company_id || "",
              });
            },
            failure: async (res) => {
              toast.error(
                res?.response?.data?.message || "Failed to fetch job"
              );
            },
          }
        );
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    };

    fetchData();
  }, [editingData?._id]);

  const handleDescriptionChange = (value: string) => {
    setForm((prev: any) => ({
      ...prev,
      description: value,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        await BackendService.Get(
          {
            url: `${GET_ALL_COMPANIES}?page=1&limit=30&search=${searchText}`,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              setFilteredCompanies(response?.companies || []);
              setLoadingCompanies(false);
            },
            failure: () => {
              toast.error("Failed to load companies");
              setLoadingCompanies(false);
            },
          }
        );
      } catch (error) {
        toast.error("Something went wrong while loading companies");
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [admintoken, searchText]);

  const fetchLocations = async (query = "") => {
    try {
      const queryParams = query ? `?search=${query}` : "";
      await BackendService.Get(
        {
          url: `${GET_ALL_CITIES}${queryParams}?page=1&limit=50`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setLocations(response || []);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to load locations");
    }
  };

  const fetchCategories = async (query = "") => {
    try {
      const queryParams = query ? `?search=${query}` : "";
      await BackendService.Get(
        {
          url: `${GET_ALL_JOB_CATEGORIES}${queryParams}?page=1&limit=50`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setCategories(response || []);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const isEdit = !!editingData?._id;

    const parseNumber = (val: any): number | null => {
      if (val === undefined || val === null) return null;
      if (typeof val === "number") return Number.isFinite(val) ? val : null;
      const s = String(val).trim();
      if (s === "") return null;
      const cleaned = s.replace(/[^\d.-]/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : null;
    };

    const title = form.title?.trim() ?? "";
    const description = form.description?.trim() ?? "";
    const salaryMin = parseNumber(form.salaryMin);
    const salaryMax = parseNumber(form.salaryMax);
    const expMin = parseNumber(form.expMin);
    const expMax = parseNumber(form.expMax);
    if (
      !title ||
      typeof title !== "string" ||
      title.trim() === "" ||
      !/^[A-Za-z\s]+$/.test(title)
    ) {
      toast.error(
        "Job title is required and must contain only characters and spaces"
      );
      setLoading(false);
      return;
    }
    if (!description || description.length < 20) {
      toast.error("Description must be at least 20 characters");
      setLoading(false);
      return;
    }

    if (salaryMin === null) {
      toast.error("Minimum salary is required");
      setLoading(false);
      return;
    }
    if (salaryMax === null) {
      toast.error("Maximum salary is required");
      setLoading(false);
      return;
    }
    if (salaryMin < 0 || salaryMax < 0) {
      toast.error("Salary cannot be negative");
      setLoading(false);
      return;
    }
    if (salaryMax < salaryMin) {
      toast.error(
        "Maximum salary must be greater than or equal to minimum salary"
      );
      setLoading(false);
      return;
    }

    if (expMin === null) {
      toast.error("Minimum experience is required");
      setLoading(false);
      return;
    }
    if (expMax === null) {
      toast.error("Maximum experience is required");
      setLoading(false);
      return;
    }
    if (expMin < 0 || expMax < 0) {
      toast.error("Experience cannot be negative");
      setLoading(false);
      return;
    }
    if (expMax < expMin) {
      toast.error(
        "Maximum experience must be greater than or equal to minimum experience"
      );
      setLoading(false);
      return;
    }
    if (expMax > 60) {
      toast.error("Maximum experience is not more than 60");
      setLoading(false);
      return;
    }

    if (!form.type) {
      toast.error("Job type is required");
      setLoading(false);
      return;
    }
    if (!form.workMode) {
      toast.error("Work mode is required");
      setLoading(false);
      return;
    }
    if (!form.lat_date_to_apply) {
      toast.error("Last date to apply is required");
      setLoading(false);
      return;
    }
    const selectedDate = new Date(form.lat_date_to_apply);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      toast.error("Last date to apply must be a future date");
      setLoading(false);
      return;
    }
    if (!form.jobCategoryId) {
      toast.error("Job category is required");
      setLoading(false);
      return;
    }
    if (!form.cityId) {
      toast.error("City is required");
      setLoading(false);
      return;
    }
    if (!form.companyId) {
      toast.error("Company is required");
      setLoading(false);
      return;
    }

    // Handle image
    let imageUrl: string | null = null;
    if (image) {
      if (typeof image === "string") {
        // already uploaded (editing, unchanged)
        imageUrl = image;
      } else {
        // it's a File object → upload it
        imageUrl = await imageUpload(image, "Thumbnail", admintoken);
        if (!imageUrl) {
          setLoading(false);
          return; // stop if upload failed
        }
      }
    }

    const payload = {
      title,
      description,
      salary: {
        min: salaryMin,
        max: salaryMax,
      },
      type: form.type,
      work_mode: form.workMode,
      experience_level: {
        min: expMin,
        max: expMax,
      },
      lat_date_to_apply: form.lat_date_to_apply,
      job_category_id: form.jobCategoryId,
      city_id: form.cityId,
      company_id: form.companyId,
      image: imageUrl, // attach uploaded/existing image URL
    };

    const method = isEdit ? "Patch" : "Post";

    try {
      await BackendService[method](
        {
          url: isEdit ? `${UPDATE_JOB}/${editingData?._id}` : CREATE_JOB,
          data: payload,
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success(
              isEdit ? "Job updated successfully!" : "Job created successfully!"
            );
            onSubmit();
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message?.messages?.[0]?.messages?.[0] ||
                (isEdit
                  ? "Failed to update the Job."
                  : "Failed to create the Job.")
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

  useEffect(() => {
    fetchLocations();
    fetchCategories();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-5xl shadow-lg">
        <div className="flex items-center justify-between relative">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {editingData ? "Edit Job" : "Add New Job"}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            isLoading={loadingCompanies}
            options={filteredCompanies.map((c) => ({
              value: c._id,
              label: c.company_name,
            }))}
            onInputChange={(val) => setSearchText(val)}
            onChange={(option) =>
              setForm((prev) => ({ ...prev, companyId: option?.value || "" }))
            }
            value={
              form.companyId
                ? {
                    value: form.companyId,
                    label:
                      filteredCompanies.find((c) => c._id === form.companyId)
                        ?.company_name || "Selected",
                  }
                : null
            }
            placeholder="Search and select a company..."
          />

          {/* Grid Section */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Job Title"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />

            <select
              value={form.jobCategoryId}
              onChange={(e) =>
                setForm({ ...form, jobCategoryId: e.target.value })
              }
              className="border rounded px-3 py-2"
            >
              <option value="">Category</option>
              {categories?.jobCategories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            >
              <option value="">Select Job Type</option>
              <option value="FULL-TIME">Full-Time</option>
              <option value="PART-TIME">Part-Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FREELANCE">Freelance</option>
            </select>

            <select
              value={form.cityId}
              onChange={(e) => setForm({ ...form, cityId: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">Location</option>
              {locations?.cities?.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>

            <select
              name="workMode"
              value={form.workMode}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            >
              <option value="">Select Work Mode</option>
              <option value="REMOTE">Remote</option>
              <option value="ON-SITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
            </select>

            <input
              type="date"
              name="lat_date_to_apply"
              value={form.lat_date_to_apply}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
          </div>

          {/* Salary + Experience */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="salaryMin"
              value={form.salaryMin}
              onChange={handleChange}
              placeholder="Min Salary"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />

            <input
              type="number"
              name="salaryMax"
              value={form.salaryMax}
              onChange={handleChange}
              placeholder="Max Salary"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />

            <input
              type="number"
              name="expMin"
              value={form.expMin}
              onChange={handleChange}
              placeholder="Min Experience (years)"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />

            <input
              type="number"
              name="expMax"
              value={form.expMax}
              onChange={handleChange}
              placeholder="Max Experience (years)"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
          </div>

          {/* Description */}
          <div className="flex w-full justify-between gap-3">
            <ReactQuill
              value={form.description}
              onChange={handleDescriptionChange}
              modules={modules}
              placeholder="Job Description"
              className="h-22 rounded-lg"
            />
            <div className="space-y-2 w-1/2">
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
                      drag and drop ( optional )
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 20MB</p>
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
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-4 py-2 rounded"
            >
              {loading ? (
                <Icons.loading />
              ) : (
                <>{editingData ? "Update Job" : "Add Job"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
