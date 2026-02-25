import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { BackendService } from "../Utils/Backend";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  GET_ADMIN_PROFILE,
  UPDATE_ADMIN_PROFILE,
} from "../constants/ApiConstants";
import { imageUpload } from "../components/ImageUpload";
import { Icons } from "../components/icons";

type ProfileValues = {
  profile: File | string | null;
  first_name: string;
  last_name: string;
  bio: string;
  experience: number | "";
  tags: string[];
};

const Profile = () => {
  const [profileData, setProfileData] = useState<any>([]);
  const [pendingTag, setPendingTag] = useState("");
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const userData = useSelector((state: any) => state.AuthReducer.userData);
  const [loading, setLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validationSchema = Yup.object().shape({
    first_name: Yup.string()
      .min(1, "Too short")
      .max(20, "Maximum 20 Characters")
      .required("Required"),
    bio: Yup.string().min(10, "Too short").required("Please add a short bio"),
    experience: Yup.number()
      .typeError("Experience must be a number")
      .min(0, "Can't be negative")
      .max(
        80,
        "Maximum Experience should not be more than 80 Years and must be in numbers"
      )
      .required("Required"),
  });

  const formik = useFormik<ProfileValues>({
    enableReinitialize: true,
    initialValues: {
      profile: profileData?.profile || null,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      bio: profileData.bio,
      experience: profileData.experience,
      tags: profileData.tags,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (pendingTag.trim() !== "") {
        toast.error(
          "Please add the tag by pressing Enter or Comma before updating."
        );
        return;
      }
      setLoading(true);
      try {
        let profileUrl = values.profile;

        if (values.profile instanceof File) {
          profileUrl = await imageUpload(values.profile, "Profile", admintoken);
        }

        const updated = {
          ...values,
          profile: profileUrl,
          tags: values.tags.map((tag: string) => tag.trim()),
        };
        await BackendService.Post(
          {
            url: `${UPDATE_ADMIN_PROFILE}`,
            data: updated,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              fetchData();
              toast.success("Profile updated successfully");
            },
            failure: async (response) => {
              toast.error(response?.data?.message);
            },
          }
        );
      } catch (err: any) {
        toast.error("Failed to update profile. Try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      await BackendService.Get(
        {
          url: `${GET_ADMIN_PROFILE}`,
          accessToken: admintoken,
        },
        {
          success: (response) => {
            setProfileData(response || []);
            setLoading(false);
          },
          failure: async (response) => {
            toast.error(response?.response?.data?.message);
            setLoading(false);
          },
        }
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0] ?? null;
    const MAX_SIZE = 20 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      toast("File size must be less than 20MB");
      e.target.value = "";
      return;
    }
    formik.setFieldValue("profile", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewSrc(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewSrc(null);
    }
  };

  const clearImage = () => {
    formik.setFieldValue("profile", null);
    setPreviewSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="h-[90vh] pt-4 flex items-start justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div
        // initial={{ opacity: 0, y: 6 }}
        // animate={{ opacity: 1, y: 0 }}
        // transition={{ duration: 0.45 }}
        className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-6 pb-3"
      >
        <header className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : typeof formik.values.profile === "string" ? (
                <img
                  src={formik.values.profile}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-600 text-center px-2">
                  <div className="text-xl font-semibold">
                    {formik.values.first_name?.[0]?.toUpperCase() || "T"}
                    {formik.values.last_name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div className="text-xs">favicon.ico</div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 right-0 bg-white border rounded-full p-1 shadow text-sm"
              title="Change profile"
            >
              ✎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold capitalize">
              {formik.values.first_name} {formik.values.last_name}
            </h2>
            <p className="text-sm text-gray-500">
              Design Teacher • {formik.values.experience} yrs
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-gray-400">Connected email</div>
            <div className="text-sm font-medium">{userData?.email}</div>
          </div>
        </header>

        <form onSubmit={formik.handleSubmit}>
          {/* First & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First name
              </label>
              <input
                name="first_name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="First name"
              />
              {formik.touched.first_name && formik.errors.first_name && (
                <div className="text-xs text-red-500 mt-1">
                  {formik.errors.first_name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last name
              </label>
              <input
                name="last_name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Last name"
              />
              {formik.touched.last_name && formik.errors.last_name && (
                <div className="text-xs text-red-500 mt-1">
                  {formik.errors.last_name}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                value={userData?.email}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Experience (years)
              </label>
              <input
                name="experience"
                value={formik.values.experience}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type="number"
                min={0}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formik.touched.experience && formik.errors.experience && (
                <div className="text-xs text-red-500 mt-1">
                  {formik.errors.experience}
                </div>
              )}
            </div>
          </div>

          {/* Short bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Short bio</label>
            <textarea
              name="bio"
              value={formik.values.bio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={4}
              minLength={1}
              maxLength={350}
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="Write a short introduction about yourself"
            />
            {formik.touched.bio && formik.errors.bio && (
              <div className="text-xs text-red-500 mt-1">
                {formik.errors.bio}
              </div>
            )}
          </div>

          {/* Tags input */}
          <div className="md:col-span-2 mt-4">
            <label className="block text-sm font-medium mb-1">Tags</label>

            <div className="flex flex-wrap gap-2 mb-2">
              {formik.values.tags?.map((tag: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = formik.values.tags.filter(
                        (_, i) => i !== index
                      );
                      formik.setFieldValue("tags", newTags);
                    }}
                    className="text-gray-500 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <input
              type="text"
              name="tagsInput"
              value={pendingTag}
              placeholder="Enter tags separated by commas"
              onChange={(e) => setPendingTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const input = (e.target as HTMLInputElement).value.trim();
                  if (input && !formik.values.tags.includes(input)) {
                    formik.setFieldValue("tags", [
                      ...formik.values.tags,
                      input,
                    ]);
                    setPendingTag("");
                  }
                  (e.target as HTMLInputElement).value = "";
                }
              }}
              className="w-full px-4 py-2 border rounded-lg"
            />

            <p className="text-xs text-gray-400 mt-1">
              Press <strong>Enter</strong> or <strong>,</strong> to add tags
            </p>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex items-center justify-end gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-lg shadow hover:opacity-95 disabled:opacity-60"
            >
              {loading ? <Icons.loading /> : null}
              <span>{loading ? "Updating..." : "Update profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
