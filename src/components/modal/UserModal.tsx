import React, { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  photo: string;
  email: string;
  phone: string;
  countryCode: string;
  subscription: "Active" | "Inactive" | "Trial";
}

interface Props {
  onClose: () => void;
  onSave: (user: User) => void;
  editingUser: User;
}

const UserModal: React.FC<Props> = ({ onClose, onSave, editingUser }) => {
  const [formData, setFormData] = useState<User>(editingUser);

  useEffect(() => {
    setFormData(editingUser);
  }, [editingUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-lg shadow-xl">
        <h2 className="text-lg font-bold mb-4">Edit User</h2>

        <div className="space-y-4">
          <input
            type="text"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="flex gap-2">
            <input
              type="text"
              name="countryCode"
              placeholder="+1"
              className="w-1/3 px-4 py-2 border rounded"
              value={formData.countryCode}
              onChange={handleChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone number"
              className="w-2/3 px-4 py-2 border rounded"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <select
            name="subscription"
            value={formData.subscription}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Trial">Trial</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
