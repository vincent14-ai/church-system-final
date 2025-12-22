import { useRef, useState } from "react";

export default function PhotoUpload({ data, setData }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setData(prev => ({
      ...prev,
      photoPreview: previewUrl,
      selectedFile: file,   // <-- Save file for later upload
    }));
  };

  const removePhoto = () => {
    if (data.photoPreview) URL.revokeObjectURL(data.photoPreview);

    setData(prev => ({
      ...prev,
      photoPreview: null,
      selectedFile: null,
      photo_url: "",
      photoPath: "",
      photo: "",
    }));
  };

  return (
    <div className="flex flex-row gap-3">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Select Photo
        </button>

        {(data.photoPreview || data.photo || data.photo_url) && (
          <button type="button" onClick={removePhoto}>Remove</button>
        )}
      </div>
    </div>
  );
}

