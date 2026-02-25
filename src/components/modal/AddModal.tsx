import React, { useState, useEffect } from "react";
import { BackendService } from "../../Utils/Backend";
import {
  UPDATE_CITY,
  CREATE_CITY,
  CREATE_JOB_CATEGORY,
  UPDATE_JOB_CATEGORY,
  CREATE_COURSE_CATEGORY,
  UPDATE_COURSE_CATEGORY,
  CREATE_LESSION,
  UPDATE_LESSION,
  CREATE_COURSE_MATERIAL,
} from "../../constants/ApiConstants";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { imageUpload } from "../ImageUpload";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  editing?: any;
  type: string;
  onSubmit: () => void;
}

const getHeading = (type: string, isEdit: boolean) => {
  if (type === "company") return isEdit ? "Edit Company" : "Add New Company";
  if (type === "course category")
    return isEdit ? "Edit Course Category" : "Add New Course Category";
  if (type === "job category")
    return isEdit ? "Edit Job Category" : "Add New Job Category";
  if (type === "Lesson") return isEdit ? "Edit Lesson" : "Add New Lesson";
  if (type === "city") return isEdit ? "Edit City" : "Add New City";
  if (type === "course material")
    return isEdit ? "Edit Course Material" : "Add Course Material";
  return isEdit ? "Edit Item" : "Add New Item";
};

const AddModal: React.FC<Props> = ({ editing, onClose, type, onSubmit }) => {
  const [name, setName] = useState("");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const [media, setMedia] = useState<any>(null); // could be icon, thumbnail or file
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing?._id) {
      if (type !== "course material") {
        setName(editing?.name || "");
      }
      if (type === "Lesson") {
        setMedia(editing?.thumbnail);
      } else if (type === "course material") {
        setMedia(editing?.resource_url);
      } else {
        setMedia(editing?.icon);
      }
    }
  }, [editing, type]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
    }
  };

  const getUrlsByType = (type: string) => {
    switch (type) {
      case "course category":
        return {
          create: CREATE_COURSE_CATEGORY,
          update: UPDATE_COURSE_CATEGORY,
        };
      case "job category":
        return { create: CREATE_JOB_CATEGORY, update: UPDATE_JOB_CATEGORY };
      case "city":
        return { create: CREATE_CITY, update: UPDATE_CITY };
      case "Lesson":
        return { create: CREATE_LESSION, update: UPDATE_LESSION };
      case "course material":
        return { create: CREATE_COURSE_MATERIAL, update: "" };
      default:
        return { create: "", update: "" };
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const isEdit = !!editing?._id;
    const { create, update } = getUrlsByType(type);

    // ✅ Skip name validations for course material
    if (type !== "course material") {
      if (!name.trim()) {
        toast.error("Name is required.");
        return;
      }
      if (name.trim().length < 2) {
        toast.error("Name must be at least 2 characters.");
        return;
      }
      if (name.trim().length > 30) {
        toast.error("Name cannot exceed 30 characters.");
        return;
      }
    }

    if (
      type !== "course category" &&
      type !== "job category" &&
      type !== "city" &&
      !media
    ) {
      toast.error("Please upload a file.");
      return;
    }

    setLoading(true);
    try {
      let uploadedMediaUrl;

      if (media) {
        if (typeof media === "string") {
          uploadedMediaUrl = media;
        } else {
          let uploadType = "Thumbnail";
          if (type === "Lesson") {
            uploadType = "Thumbnail";
          } else if (type === "course material") {
            uploadType = "CourseMaterial";
          }

          uploadedMediaUrl = await imageUpload(media, uploadType, admintoken);
        }
      }

      let response;
      if (isEdit) {
        const payload =
          type === "course material"
            ? {
                course_id: id,
                resource_url: uploadedMediaUrl,
              }
            : {
                name,
                ...(uploadedMediaUrl &&
                  (type === "Lesson"
                    ? { thumbnail: uploadedMediaUrl }
                    : { icon: uploadedMediaUrl })),
                ...(type === "Lesson" && { course_id: id }),
              };

        response = await BackendService.Patch(
          {
            url: `${update}/${editing?._id}`,
            data: payload,
            accessToken: admintoken,
          },
          {
            success: () => {
              toast.success(`${type} updated successfully!`);
              onSubmit();
            },
            failure: (res) => {
              toast.error(
                res?.response?.data?.message || `Failed to update the ${type}.`
              );
            },
          }
        );
      } else {
        const payload =
          type === "city" || type === "course category"
            ? { name }
            : type === "course material"
            ? {
                course_id: id,
                resource_url: uploadedMediaUrl,
              }
            : {
                name,
                ...(uploadedMediaUrl &&
                  (type === "Lesson"
                    ? { thumbnail: uploadedMediaUrl }
                    : { icon: uploadedMediaUrl })),
                ...(type === "Lesson" && { course_id: id }),
              };

        response = await BackendService.Post(
          {
            url: create,
            accessToken: admintoken,
            data: payload,
          },
          {
            success: () => {
              toast.success(`${type} created successfully!`);
              onSubmit();
            },
            failure: (res) => {
              toast.error(
                res?.response?.data?.message || `Failed to create the ${type}.`
              );
            },
          }
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between relative">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {getHeading(type, !!editing)}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Hide name input for course material */}
          {type !== "course material" && (
            <input
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                type === "Lesson"
                  ? "Lesson Title"
                  : `${type.charAt(0).toUpperCase() + type.slice(1)} Name`
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {type !== "city" &&
            type !== "course category" &&
            type !== "job category" && (
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  {type === "Lesson"
                    ? "Upload Thumbnail:"
                    : type === "course material"
                    ? "Upload Course Material"
                    : "Upload Image:"}
                </label>
                {!media ? (
                  <label
                    htmlFor="media-upload"
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
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">Required image size: 232px (H) × 414px (W)</p>
                      <p className="text-xs text-gray-400">
                        {type === "course material"
                          ? "Any file type up to 10MB"
                          : "PNG, JPG up to 20MB"}
                      </p>
                    </div>
                    <input
                      id="media-upload"
                      type="file"
                      accept={type === "course material" ? "*" : "image/*"}
                      className="hidden"
                      onChange={handleMediaUpload}
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-48 border rounded overflow-hidden group flex items-center justify-center bg-gray-50">
                    {/* ✅ Show preview if image, else show file name */}
                    {typeof media === "string" ? (
                      media.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          src={media}
                          alt="Uploaded"
                          className="object-cover w-full h-full transition-opacity"
                        />
                      ) : (
                        <p className="text-gray-600 text-sm">
                          {media.split("/").pop()}
                        </p>
                      )
                    ) : media.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(media)}
                        alt="Uploaded"
                        className="object-cover w-full h-full transition-opacity"
                      />
                    ) : (
                      <p className="text-gray-600 text-sm">{media.name}</p>
                    )}

                    <button
                      type="button"
                      onClick={() => setMedia(undefined)}
                      className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : editing ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
