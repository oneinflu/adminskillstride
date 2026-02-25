import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BackendService } from "../../Utils/Backend";
import {
  GET_ORGANIZATION_BY_ID,
  UPDATE_ORGANIZATION,
  CREATE_ORGANIZATION,
} from "../../constants/ApiConstants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icons } from "../icons";
import { imageUpload } from "../ImageUpload";

interface AdminModalProps {
  onClose: () => void;
  editing?: any;
  onSubmit: () => void;
}

const OrganizationModal: React.FC<AdminModalProps> = ({
  onClose,
  editing,
  onSubmit,
}) => {
  const [image, setImage] = useState<any>(editing?.logo || null);
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        await BackendService.Get(
          {
            url: `${GET_ORGANIZATION_BY_ID}/${editing?._id}`,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              setForm({
                name: response?.data?.name || "",
                email: response?.data?.email || "",
              });
              setImage(response?.data?.logo || "");
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

    if (editing?._id) {
      fetchOrganizationDetails();
    }
  }, [editing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleOrganization = async () => {
    // --- Form Validations ---
    if (!form.name?.trim()) {
      toast.error("Organization name is required.");
      return;
    }
    if (form.name.trim().length < 3) {
      toast.error("Organization name must be at least 3 characters long.");
      return;
    }
    if (form.name.trim().length > 40) {
      toast.error("Organization name cannot exceed 40 characters.");
      return;
    }
    if (!form.email?.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!image) {
      toast.error("Organization thumbnail is required.");
      return;
    }

    setLoading(true);
    const isEdit = editing?._id;

    try {
      let uploadedImageUrl = editing?.image; // default to existing image

      // Only upload if user selected a new File
      if (image && typeof image !== "string") {
        uploadedImageUrl = await imageUpload(image, "Thumbnail", admintoken);
      }

      const payload = isEdit
        ? {
            name: form.name,
            logo: uploadedImageUrl,
            email: form.email,
          }
        : {
            ...form,
            logo: uploadedImageUrl,
          };

      let method = isEdit ? BackendService.Put : BackendService.Post;

      await method(
        {
          url: isEdit
            ? `${UPDATE_ORGANIZATION}/${editing?._id}`
            : CREATE_ORGANIZATION,
          data: payload,
          accessToken: admintoken,
        },
        {
          success: () => {
            toast.success(
              isEdit
                ? "Organization updated successfully!"
                : "Organization created successfully!"
            );
            onSubmit();
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                (isEdit
                  ? "Failed to update the Organization."
                  : "Failed to create the Organization.")
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
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {editing ? "Edit Organization" : "Create Organization"}
          </h2>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              name="name"
              placeholder="Organization Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="flex gap-4">
            <input
              name="email"
              placeholder="Organization Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
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
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleOrganization}
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

export default OrganizationModal;
