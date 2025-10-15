import type { FirebaseStorage } from "firebase/storage";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage as firebaseStorage, isConfigured } from "@/config/firebase";

async function uploadImage(file: File, pathPrefix = "photos"): Promise<string> {
  // Fallback: if firebase not configured, throw so caller can fallback to base64
  if (!isConfigured || !firebaseStorage) {
    throw new Error("Firebase Storage não está configurado");
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const storagePath = `${pathPrefix}/${timestamp}_${safeName}`;

  const storageRef = ref(firebaseStorage as FirebaseStorage, storagePath);

  // Convert File to ArrayBuffer/Uint8Array via Blob -> uploadBytes works with Blob
  try {
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.error("Erro ao fazer upload para Firebase Storage:", err);
    throw err;
  }
}

async function deleteFileByUrl(url: string): Promise<void> {
  if (!isConfigured || !firebaseStorage) {
    throw new Error("Firebase Storage não está configurado");
  }

  try {
    // Extrair caminho do bucket a partir da URL retornada por getDownloadURL
    // URLs têm formato: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>?alt=media&token=...
    const m = url.match(/\/o\/(.+)\?/);
    const path = m ? decodeURIComponent(m[1]) : null;
    if (!path) {
      console.warn("URL não parece ser do Storage, ignorando delete:", url);
      return;
    }

    const storageRef = ref(firebaseStorage as FirebaseStorage, path);
    await deleteObject(storageRef);
  } catch (err) {
    console.error("Erro ao deletar arquivo do Storage:", err);
    throw err;
  }
}

export { uploadImage, deleteFileByUrl };
