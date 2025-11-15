import React, { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function PhotoUpload({ data, setData }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview image instantly
    const previewUrl = URL.createObjectURL(file);
    setData((prev) => ({ ...prev, photoPreview: previewUrl }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const res = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUploading(false);

      // Save URL returned by backend
      setData((prev) => ({
        ...prev,
        photo_url: res.data.fileUrl, // final cloud url
        photo: res.data.fileUrl, // keep a consistent naming for usage
      }));

      toast.success("Photo uploaded successfully!");
    } catch (err) {
      console.error("Photo upload failed:", err);
      setUploading(false);
      toast.error("Photo upload failed.");
    }
  };

  const removePhoto = () => {
    setData((prev) => ({
      ...prev,
      photo_url: "",
      photo: "",
      photoPreview: null,
    }));
  };

  return (
    <div className="flex flex-row gap-3">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-md border bg-secondary hover:bg-secondary/70 transition"
        >
          {uploading ? "Uploading…" : "Upload Photo"}
        </button>

        {(data.photoPreview || data.photo) && (
          <button
            type="button"
            onClick={removePhoto}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
