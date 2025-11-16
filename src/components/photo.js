import { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { toast } from "sonner";

export default function PhotoUpload({ data, setData }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error("You must be logged in to upload photos.");
    return;
  }

  // Show preview instantly
  const previewUrl = URL.createObjectURL(file);
  setData(prev => ({ ...prev, photoPreview: previewUrl }));

  try {
    setUploading(true);

    const fileName = `${Date.now()}_${file.name}`;

    // Upload directly to public bucket
    const { data: uploadData, error } = await supabase
      .storage
      .from("profile-photos")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    // Get public URL (no signed URL needed)
    const { data: urlData } = supabase
      .storage
      .from("profile-photos")
      .getPublicUrl(fileName);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      console.error("No public URL returned from getPublicUrl");
      throw new Error("Failed to get public URL for uploaded file");
    }

    setData(prev => {
      const newData = {
        ...prev,
        photo_url: publicUrl,
        photo: publicUrl,
      };
      return newData;
    });

    toast.success("Photo uploaded successfully!");
  } catch (err) {
    console.error("Photo upload failed:", err);
    toast.error("Photo upload failed.");
  } finally {
    setUploading(false);
  }
};


  const removePhoto = () => {
    if (data.photoPreview) {
      URL.revokeObjectURL(data.photoPreview);
    }
    setData(prev => ({
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
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          {uploading ? "Uploading…" : "Upload Photo"}
        </button>
        {(data.photoPreview || data.photo || data.photo_url) && (
          <button type="button" onClick={removePhoto}>Remove</button>
        )}
      </div>
    </div>
  );
}
