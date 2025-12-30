import { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Loader2 } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30',
    outline: 'border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-red-500/30',
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

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

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
        <Button type="button" variant="outline" className="gap-2 border-dashed border-slate-300 dark:border-slate-600" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : "Upload Photo"}
        </Button>
    </div>
  );
}
