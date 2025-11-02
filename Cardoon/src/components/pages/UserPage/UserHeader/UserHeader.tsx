import { useRef, useState } from "react";
import { useUser } from "../../../../hooks/contexts/useUser";
import Button from "../../../atoms/Button/Button";
import ExpBar from "../../../atoms/ExpBar/ExpBar";

export default function UserHeader() {
  const { user, updateImage } = useUser();
  const { username } = user;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("Le fichier est trop volumineux. Taille maximale: 10MB");
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner un fichier image valide");
        return;
      }

      console.log("Fichier sélectionné:", file);
      setSelectedFile(file);

      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setAvatarPreview(result);
        } else {
          console.warn("FileReader result is not a string:", result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveImage = async () => {
    if (!selectedFile) return;
    updateImage(selectedFile);
  };

  return (
    <section className="UserPage__header">
      <div
        className="UserPage__header-avatar-container"
        title="Modifier la photo de profil"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="UserPage__header-avatar-upload"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <img
          className="UserPage__header-avatar"
          src={avatarPreview || user.image || "https://picsum.photos/200/300"}
          alt={`Avatar de ${username}`}
          onClick={handleAvatarClick}
        />
        {avatarPreview && (
          <div className="avatar-preview-actions">
            <Button onClick={saveImage}>Sauvegarder</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setAvatarPreview(null);
                setSelectedFile(null);
              }}
            >
              Annuler
            </Button>
          </div>
        )}
      </div>
      <div className="UserPage__header-info">
        <h3>{username}</h3>
        <p>Expérience</p>
        <ExpBar currentExp={1230} />
      </div>
    </section>
  );
}
