"use client";
import React, { useEffect, useState } from "react";

export default function ManageImagesPage() {
  const [images, setImages] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/add-image");
      if (!res.ok) throw new Error("Failed to load images");
      const data = await res.json();
      // The API returns { message, images }
      setImages(data.images || []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error fetching images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const payload = {
          image: base64,
          addedBy: "admin",
          addedByUid: "admin",
        };
        const res = await fetch("/api/add-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Upload failed");
        await fetchImages();
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, s3Key?: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch("/api/add-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, s3Key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      await fetchImages();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Delete error");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Images</h1>

      <div className="mb-4">
        <label className="inline-block bg-white/5 border rounded px-4 py-2 cursor-pointer">
          {uploading ? "Uploading..." : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {loading ? (
        <div>Loading images...</div>
      ) : images.length === 0 ? (
        <div>No images uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {images.map((img: any) => (
            <div key={img.id} className="border rounded p-2 bg-white/5">
              <div className="w-full h-40 bg-black/5 rounded overflow-hidden mb-2">
                <img src={img.imageUrl} alt="img" className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-between items-center gap-2">
                <div className="text-sm text-gray-300">{new Date(img.uploadedAt).toLocaleString?.() || ""}</div>
                <div className="flex gap-2">
                  <a href={img.imageUrl} target="_blank" rel="noreferrer" className="underline text-sm">Open</a>
                  <button onClick={() => handleDelete(img.id, img.s3Key)} className="text-sm text-red-400">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
