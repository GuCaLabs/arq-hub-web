import { notFound } from "next/navigation";
import Image from "next/image";
import { VerifiedIcon, CameraIcon } from "lucide-react";
import { ExpandableText } from "@/components/ui/expandable-text";
import { ProfileHeaderObserver } from "@/components/ui/profile-header-observer";
import { fetchApi } from "@/lib/api";

export async function getWorkspaceProfile(slug: string) {
  try {
    // Revalidates cache every 60 seconds (ISR)
    const res = await fetchApi(`/workspaces/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default async function WorkspaceProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const profile = await getWorkspaceProfile(slug);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col items-center">
        {/* Profile Section */}
        <div className="flex flex-col justify-center gap-4 p-4 md:pt-8 max-w-2xl w-full">
          <ProfileHeaderObserver slug={profile.slug}>
            <div className="flex items-center justify-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                {profile.logoUrl ? (
                  <Image
                    src={profile.logoUrl}
                    alt={profile.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-400 dark:text-gray-500">
                    {getInitials(profile.name)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col md:gap-1">
                <h2 className="flex items-center gap-2 font-bold text-2xl">
                  @{profile.slug}
                  <VerifiedIcon size={20} color="#3b82f6" />
                </h2>

                <h2 className="text-lg text-gray-500">{profile.name}</h2>

                {/* Bio */}
                {profile.description && (
                  <ExpandableText
                    text={profile.description}
                    className="hidden md:block text-sm text-gray-700 dark:text-gray-300"
                  />
                )}
              </div>
            </div>
          </ProfileHeaderObserver>

          {/* Bio */}
          {profile.description && (
            <ExpandableText
              text={profile.description}
              className="md:hidden text-sm text-gray-700 dark:text-gray-300"
            />
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 py-4">
            {profile.phone && (
              <a
                href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg text-sm text-center transition-colors"
              >
                Contato
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg text-sm text-center transition-colors"
              >
                Website
              </a>
            )}
          </div>
        </div>

        {/* Portfolio Grid */}
        {!profile.portfolio ? (
          <div className="flex flex-col items-center justify-center gap-2 p-4">
            <div className="rounded-full border border-gray-400 text-gray-800 p-4">
              <CameraIcon size={32} />
            </div>
            <p className="text-xl font-bold">Em breve</p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-0.5 md:p-4 pb-4">
            {Array.from({ length: 15 }).map((_, index) => (
              <div
                key={index}
                className={`${
                  index == 0
                    ? "md:rounded-tl-lg"
                    : index == 2
                      ? "md:rounded-tr-lg"
                      : ""
                } 
              aspect-3/4 bg-gray-100 dark:bg-gray-900 flex items-center justify-center`}
              >
                <span className="text-xs text-gray-400">Em breve</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
