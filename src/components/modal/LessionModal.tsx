import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BackendService } from "../../Utils/Backend";
import {
  GET_VIDEO_BY_ID,
  UPDATE_LESSON_VIDEO,
  CREATE_LESSON_VIDEO,
} from "../../constants/ApiConstants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icons } from "../icons";
import { imageUpload } from "../ImageUpload";
import { useLocation } from "react-router-dom";

interface VideoModalProps {
  onClose: () => void;
  videoData?: any;
}

const AddLessonModal: React.FC<VideoModalProps> = ({ onClose, videoData }) => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const courseId = params.get("course_id");
  const lessonId = params.get("lesson_id");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    thumbnail: "",
    base_video_url: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const isEdit = !!videoData?._id;

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        await BackendService.Get(
          {
            url: `${GET_VIDEO_BY_ID}/${videoData?._id}`,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              const video = response;
              setForm({
                name: video?.name || "",
                description: video?.description || "",
                thumbnail: video?.thumbnail || "",
                base_video_url: video?.base_video_url || "",
              });
            },
            failure: async (response) => {
              toast.error(response?.data?.message);
              setLoading(false);
            },
          }
        );
      } catch (error) {
        setLoading(false);
        console.error("Error fetching video details:", error);
      }
    };

    if (isEdit) {
      fetchVideoDetails();
    }
  }, [videoData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return
    }
    if (form.name.trim().length < 3) {
      toast.error("Name must be at least 3 characters.");
      return
    }

    if (!form.description.trim()) {
      toast.error("Description is required.");
      return
    }
    if (form.description.trim().length < 5) {
      toast.error("Description must be at least 5 characters.");
      return
    }

    if ( !thumbnailFile && !form.thumbnail) {
      toast.error("Thumbnail is required.");
      return
    }

    if ( !videoFile && !form.base_video_url) {
      toast.error("Video is required.");
      return
    }
    setLoading(true);
    try {
      let thumbnailUrl = form.thumbnail;
      let videoUrl = form.base_video_url;

      // Upload new files if selected
      if (thumbnailFile) {
        thumbnailUrl = await imageUpload(
          thumbnailFile,
          "Thumbnail",
          admintoken
        );
      }
      if (videoFile) {
        videoUrl = await imageUpload(videoFile, "Lession", admintoken);
      }

      const payload = isEdit
        ? {
            ...form,
            thumbnail: thumbnailUrl,
            base_video_url: videoUrl,
            course_id: courseId,
            lesson_id: lessonId,
          }
        : {
            ...form,
            thumbnail: thumbnailUrl,
            base_video_url: videoUrl,
            course_id: courseId,
            lesson_id: lessonId,
          };
      const apiCall = isEdit ? BackendService.Patch : BackendService.Post;
      await apiCall(
        {
          url: isEdit
            ? `${UPDATE_LESSON_VIDEO}/${videoData?._id}`
            : CREATE_LESSON_VIDEO,
          data: payload,
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success(isEdit ? "Video updated!" : "Video created!");
            onClose();
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                (isEdit ? "Failed to update video" : "Failed to create video")
            );
          },
        }
      );
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const validateThumbnail = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

      if (file.size > MAX_SIZE) {
        toast.error("Thumbnail size must be less than 20MB");
        resolve(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width !== 414 || img.height !== 232) {
            toast.error("Image must be exactly 232px height and 414px width");
            resolve(false);
          } else {
            resolve(true);
          }
        };
        img.src = e.target?.result as string;
      };
  
      reader.readAsDataURL(file);
    });
  };
  

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Video" : "Add Video"}
          </h2>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            {/* Name */}
            <div className="w-1/2">
              <label>Name</label>
              <input
                name="name"
                placeholder="Video Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* Description */}
            <div className="w-1/2">
              <label>Description</label>
              <input
                name="description"
                placeholder="Enter Description"
                value={form.description}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="space-y-2 w-1/2">
              <label className="block font-medium text-gray-700">
                Thumbnail
              </label>

              {form.thumbnail && !thumbnailFile ? (
                // Preview existing thumbnail in edit mode
                <div className="relative w-full h-48 border rounded overflow-hidden">
                  <img
                    src={form.thumbnail}
                    alt="Thumbnail"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, thumbnail: "" }))
                    }
                    className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black"
                  >
                    Remove
                  </button>
                </div>
              ) : thumbnailFile ? (
                // Preview newly selected file
                <div className="relative w-full h-40 border rounded overflow-hidden">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail Preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnailFile(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                // Upload placeholder
                <label
                  htmlFor="thumbnail-upload"
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
                      drag & drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 20MB</p>
                    <p className="text-xs text-gray-400">Required image size: 232px (H) × 414px (W)</p>
                  </div>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                    
                      const isValid = await validateThumbnail(file);
                    
                      if (!isValid) {
                        e.target.value = ""; // Reset input
                        return;
                      }
                    
                      setThumbnailFile(file);
                    }}
                  />
                </label>
              )}
            </div>

            {/* Video */}
            <div className="w-1/2">
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Video</label>

                {form.base_video_url && !videoFile ? (
                  // Preview existing video
                  <div className="relative w-full border rounded overflow-hidden">
                    <video
                      src={form.base_video_url}
                      controls
                      className="w-full max-h-60 rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, base_video_url: "" }))
                      }
                      className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black"
                    >
                      Remove
                    </button>
                  </div>
                ) : videoFile ? (
                  // Preview newly selected video
                  <div className="relative w-full border h-40 rounded overflow-hidden">
                    <video
                      src={URL.createObjectURL(videoFile)}
                      controls
                      className="w-full max-h-60 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  // Upload placeholder
                  <label
                    htmlFor="video-upload"
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
                          d="M15 10l4.553 2.276A1 1 0 0120 13.118V17a2 2 0 01-2 2h-4.382a1 1 0 01-.894-.553L11 15m0 0l-2-4m2 4v5"
                        ></path>
                      </svg>
                      <p className="mb-1 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag & drop
                      </p>
                      <p className="text-xs text-gray-400">
                        MP4, MOV types allowed
                      </p>
                    </div>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
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

export default AddLessonModal;
