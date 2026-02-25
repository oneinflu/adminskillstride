import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BackendService } from "../../Utils/Backend";
import {
  UPDATE_ADMIN,
  GET_ADMIN_DETAILS,
  CREATE_ADMIN,
  EDIT_ADMIN,
} from "../../constants/ApiConstants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Icons } from "../icons";

interface AdminModalProps {
  onClose: () => void;
  adminData?: any;
  onSubmit: () => void;
}

const allRoles = ["MENTOR", "OPERATIONS"];

const AdminModal: React.FC<AdminModalProps> = ({
  onClose,
  adminData,
  onSubmit,
}) => {
  const admintoken = useSelector(
    (state: any) => state.AuthReducer.userData.access_token
  );
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
    experience: "",
    designation: "",
    roles: [] as string[],
  });

  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        await BackendService.Get(
          {
            url: `${GET_ADMIN_DETAILS}/${adminData?._id}`,
            accessToken: admintoken,
          },
          {
            success: (response) => {
              console.log(response);
              setForm({
                first_name: response?.first_name || "",
                last_name: response?.last_name || "",
                email: response?.email || "",
                bio: response?.bio || "",
                designation: response?.designation || "",
                experience: response?.experience || "",
                roles: response?.roles || [],
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
        console.error("Error fetching admin details:", error);
      }
    };

    if (adminData?._id) {
      fetchAdminDetails();
    }
  }, [adminData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "experience" ? Number(value) : value,
    }));
  };

  const handleAddRole = () => {
    if (selectedRole && !form.roles.includes(selectedRole)) {
      setForm((prev) => ({
        ...prev,
        roles: [...prev.roles, selectedRole],
      }));
      setSelectedRole("");
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.filter((role) => role !== roleToRemove),
    }));
  };

  const handleAdmin = async () => {
    if (!form.first_name.trim()) {
      toast.error("First name is required!");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required!");
      return;
    }
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Enter a valid email address!");
      return;
    }
    if (!form.bio.trim()) {
      toast.error("Bio is required!");
      return;
    }
    if (!form.experience || Number(form.experience) <= 0) {
      toast.error("Experience must be greater than 0!");
      return;
    }
    if (form.roles.length === 0) {
      toast.error("At least one role must be selected!");
      return;
    }

    setLoading(true);
    const isEdit = !!adminData?._id;
    const payload = {
      first_name: form.first_name,
      email: form.email,
      bio: form.bio,
      experience: form.experience,
      designation: form.designation,
      roles: form.roles,
      ...(form.last_name?.trim()?.length ? { last_name: form.last_name } : {}),
    };
  
    try {
      await BackendService.Post(
        {
          url: isEdit ? `${EDIT_ADMIN}/${adminData?._id}` : CREATE_ADMIN,
          data: payload,
          accessToken: admintoken,
        },
        {
          success: (data) => {
            toast.success(
              isEdit
                ? "Admin updated successfully!"
                : "Admin created successfully!"
            );
            onSubmit();
          },
          failure: (response) => {
            toast.error(
              response?.response?.data?.message ||
                (isEdit
                  ? "Failed to update the admin."
                  : "Failed to create the admin.")
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

  const availableRoles = allRoles.filter((role) => !form.roles.includes(role));

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {adminData ? "Edit Admin" : "Add Admin"}
          </h2>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          <label>Full Name</label>
          <div className="flex gap-4">
            <input
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              className="w-1/2 border px-3 py-2 rounded"
            />
            <input
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              className="w-1/2 border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label>Bio</label>
            <input
              name="bio"
              placeholder="Enter Bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label>Designation</label>
            <input
              name="designation"
              placeholder="Enter Designation"
              value={form.designation}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label>Experience</label>
            <input
              name="experience"
              type="number"
              placeholder="Enter Experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label>Roles</label>
            <div className="flex gap-2 items-center">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select a role</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddRole}
                disabled={!selectedRole}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {form.roles.length > 0 && (
            <div className="mt-2">
              <label className="block mb-1 font-medium">Selected Roles:</label>
              <div className="flex flex-wrap gap-2">
                {form.roles.map((role) => (
                  <div
                    key={role}
                    className="bg-gray-200 text-sm px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    {role}
                    <button
                      onClick={() => handleRemoveRole(role)}
                      className="text-gray-600 hover:text-red-500"
                    >
                      <CloseIcon style={{ fontSize: 16 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleAdmin}
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

export default AdminModal;
