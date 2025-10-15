/**
 * Utilitários de redimensionamento/compressão de imagens (client-side)
 * - resizeImage(file, maxWidth, quality) -> File
 * - generateThumbnail(file, size, quality) -> File
 *
 * Usa Canvas para redimensionar. Trabalha no browser.
 */

export async function resizeImage(
  file: File,
  maxWidth = 1024,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const ratio = img.width / img.height;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          width = maxWidth;
          height = Math.round(maxWidth / ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D não suportado");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Falha ao gerar blob"));
            const outFile = new File([blob], file.name, { type: blob.type });
            resolve(outFile);
          },
          "image/jpeg",
          quality
        );
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao carregar imagem"));
    };
    img.src = url;
  });
}

export async function generateThumbnail(
  file: File,
  size = 120,
  quality = 0.7
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        // calcular crop central para preservar proporção do thumb
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D não suportado");

        let sx = 0,
          sy = 0,
          sWidth = img.width,
          sHeight = img.height;

        if (img.width > img.height) {
          // panorama -> crop eixo X
          sWidth = img.height;
          sx = Math.round((img.width - img.height) / 2);
        } else if (img.height > img.width) {
          // retrato -> crop eixo Y
          sHeight = img.width;
          sy = Math.round((img.height - img.width) / 2);
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Falha ao gerar blob"));
            const outFile = new File([blob], `thumb_${file.name}`, {
              type: blob.type,
            });
            resolve(outFile);
          },
          "image/jpeg",
          quality
        );
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao carregar imagem"));
    };
    img.src = url;
  });
}
