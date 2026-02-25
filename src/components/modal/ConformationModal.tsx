import React from "react";
import { Icons } from "../icons";

const ConformationModal = ({
  isOpen,
  onClose,
  onSubmit,
  content,
  buttoncontent,
  paragraphcontent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-2xl border border-gray-200 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black transition"
        >
          <Icons.close className="w-5 h-5" />
        </button>

        <div className="text-center flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-800">{content}</h2>
          <p className="text-sm text-gray-600">{paragraphcontent}</p>

          <div className="flex gap-4 pt-2">
            <button
              onClick={onClose}
              className="w-full py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
            >
              {buttoncontent}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConformationModal;
