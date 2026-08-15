import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { uploadProfilePhoto } from "@/lib/cloudinary";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

export async function POST(request: Request) {
  const user = await requireUser();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato não suportado. Envie JPEG, PNG, WEBP ou HEIC." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande (máximo 5MB)." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadProfilePhoto(buffer, file.type, user.id);
    return NextResponse.json({ url, publicId });
  } catch (error) {
    console.error("Falha no upload para o Cloudinary:", error);
    return NextResponse.json(
      { error: "Falha ao enviar a imagem. Tente novamente." },
      { status: 500 }
    );
  }
}
