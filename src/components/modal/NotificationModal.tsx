// components/modal/NotificationModal.tsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { BackendService } from "../../Utils/Backend";
import { useSelector } from "react-redux";
import {
  CREATE_NOTIFICATION,
  UPLOAD_IMAGE,
} from "../../constants/ApiConstants";
import { imageUpload } from "../ImageUpload";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onSubmit: () => void;
}

const NotificationModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("NOTIFICATIONS_PAGE");
  const [image, setImage] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const MAX_SIZE = 20 * 1024 * 1024;
      
        if (file.size > MAX_SIZE) {
          toast("File size must be less than 20MB");
          e.target.value = "";
          return;
        }
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedImageUrl;
      if (image) {
        // 👇 pass token here, instead of using hooks inside utility
        uploadedImageUrl = await imageUpload(image, "Thumbnail", admintoken);
      }

      // Step 2: Use uploaded image URL in payload
      const payload = {
        title,
        description: message,
        type,
        image: uploadedImageUrl,
      };

      // Step 3: Trigger create notification API
      await BackendService.Post(
        {
          url: CREATE_NOTIFICATION,
          accessToken: admintoken,
          data: payload,
        },
        {
          success: () => {
            toast.success(`Notification created successfully!`);
            onSubmit();
          },
          failure: (res) => {
            toast.error(
              res?.response?.data?.message ||
                `Failed to create the notification.`
            );
          },
        }
      );
    } catch (error) {
      console.error(error);
      // toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
        <div>
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">
          Create Notification
        </h2>
        <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full border p-2 rounded resize-none"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <select
            className="w-full border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="NOTIFICATIONS_PAGE">Notification Page</option>
            {/* <option value="COURSE_UPDATE">Course Update</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="REDIRECT_TO_CONVERSATION">
              Redirect to Conversation
            </option> */}
          </select>
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
                  src={URL.createObjectURL(image)}
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

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;
