import { useEffect, useState } from "react";

interface ImagePasterProp {
  onUpload: (file: File) => void;
  shouldReset?: boolean; // Used to reset the preview in a useEffect
}
export const ImagePaster = ({ onUpload, shouldReset }: ImagePasterProp) => {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (shouldReset) {
      setPreview("");
    }
  }, [shouldReset]);

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageTypes = item.types.filter((type) =>
          type.startsWith("image/")
        );
        if (imageTypes.length > 0) {
          const blob = await item.getType(imageTypes[0]);
          const extension = blob.type.split("/")[1]; // 'png', 'jpeg'...
          const filename = `pasted-image-${Date.now()}.${extension}`;
          const file = new File([blob], filename, { type: blob.type });

          // Générer l'aperçu
          setPreview(URL.createObjectURL(blob));

          // Envoyer le fichier au parent
          onUpload(file);
        }
      }
    } catch (err) {
      console.error("Erreur de collage:", err);
    }
  };

  return (
    <div onPaste={handlePaste} className="ImagePaster">
      {preview ? (
        <img src={preview} alt="Aperçu collé" />
      ) : (
        <p>Cliquez ici puis appuyez sur Ctrl+V pour coller une image</p>
      )}
    </div>
  );
};
