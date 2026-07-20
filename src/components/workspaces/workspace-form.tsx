"use client";

import { useState, useRef, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import getCroppedImg from "@/lib/crop-image";
import Image from "next/image";

export interface WorkspaceFormProps {
  initialData?: {
    name?: string;
    slug?: string;
    description?: string | null;
    logoUrl?: string | null;
    phone?: string | null;
    website?: string | null;
    instagram?: string | null;
    cau?: string | null;
    cnpj?: string | null;
  };
  isEditMode?: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
  onCancel?: () => void;
  submitButtonText?: string;
}

export function WorkspaceForm({
  initialData,
  isEditMode = false,
  onSubmit,
  isLoading,
  error,
  onCancel,
  submitButtonText = "Salvar Configurações",
}: WorkspaceFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.logoUrl || null,
  );
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [instagram, setInstagram] = useState(initialData?.instagram || "");
  const [cau, setCau] = useState(initialData?.cau || "");
  const [cnpj, setCnpj] = useState(initialData?.cnpj || "");

  // Update states if initialData changes
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setDescription(initialData.description || "");
      setLogoPreview(initialData.logoUrl || null);
      setPhone(initialData.phone || "");
      setWebsite(initialData.website || "");
      setInstagram(initialData.instagram || "");
      setCau(initialData.cau || "");
      setCnpj(initialData.cnpj || "");
    }
  }, [initialData]);

  // Crop states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [localError, setLocalError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      setLocalError("A imagem deve ter no máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImageSrc(reader.result as string);
      setIsCropModalOpen(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
    setLocalError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels) return;

      const croppedFile = await getCroppedImg(
        cropImageSrc,
        croppedAreaPixels,
        0,
        { horizontal: false, vertical: false },
        "logo.jpg",
      );

      if (croppedFile) {
        setLogo(croppedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(croppedFile);
        setIsCropModalOpen(false);
      }
    } catch {
      setLocalError("Erro ao processar o recorte da imagem.");
      setIsCropModalOpen(false);
    }
  };

  const RESERVED_SLUGS = [
    "login",
    "dashboard",
    "workspaces",
    "api",
    "admin",
    "config",
    "settings",
    "profile",
    "_next",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (isEditMode && RESERVED_SLUGS.includes(slug.toLowerCase())) {
      setLocalError(
        `O endereço "${slug}" é reservado pelo sistema e não pode ser utilizado.`,
      );
      return;
    }

    const formData = new FormData();
    if (isEditMode) {
      formData.append("name", name);
      formData.append("slug", slug);
    }
    if (description) formData.append("description", description);
    if (logo) formData.append("logo", logo);
    if (phone) formData.append("phone", phone);
    if (website) formData.append("website", website);
    if (instagram) formData.append("instagram", instagram);
    if (cau) formData.append("cau", cau);
    if (cnpj) formData.append("cnpj", cnpj);

    await onSubmit(formData);
  };

  const displayError = error || localError;

  return (
    <>
      {isCropModalOpen && cropImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg p-6 shadow-xl flex flex-col h-[80vh] max-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Ajustar Logo
              </h3>
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Fechar
              </button>
            </div>

            <div className="relative flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={(area, pixels) => setCroppedAreaPixels(pixels)}
                onZoomChange={setZoom}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zoom
              </label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div className="flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCropComplete}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Cortar Imagem
              </button>
            </div>
          </div>
        </div>
      )}

      {displayError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800/50">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 dark:bg-gray-800 relative group"
            onClick={() => fileInputRef.current?.click()}
          >
            {logoPreview ? (
              <>
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-xs text-center transition-all">
                  Alterar
                  <br />
                  Logo
                </div>
              </>
            ) : (
              <span className="text-gray-400 text-xs text-center px-2 group-hover:text-gray-600 transition-colors">
                Adicionar
                <br />
                Logo
              </span>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
          />
        </div>

        {isEditMode && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Escritório *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Studio Arquitetura"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slug (URL) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-lg text-gray-500 dark:text-gray-400 text-sm">
                  arqhub.com/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  className="w-full px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="studio-arquitetura"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio (Descrição) Opcional
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Conte-nos um pouco sobre seu escritório..."
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {description.length}/200
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Telefone
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://seu-site.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Instagram (Opcional)
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-lg text-gray-500 dark:text-gray-400 text-sm">
              @
            </span>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
              className="w-full px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="studio-arquitetura"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CAU
            </label>
            <input
              type="text"
              value={cau}
              onChange={(e) => setCau(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: A12345-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="00.000.000/0000-00"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-70 shadow-sm"
          >
            {isLoading ? "Salvando..." : submitButtonText}
          </button>

          {onCancel && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-70 shadow-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </>
  );
}
