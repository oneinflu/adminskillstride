import axios from "axios";
import { UPLOAD_IMAGE } from "../constants/ApiConstants";

// Pure function, NO hooks here
export const imageUpload = async (
  file: File,
  type: string,
  admintoken: string
): Promise<string> => {
  try {
    const form = new FormData();
    form.append("files", file);
    form.append("type", type);

    const response = await axios.post(`${UPLOAD_IMAGE}`, form, {
      headers: {
        Authorization: `Bearer ${admintoken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.assets?.[0]?.link;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
};
