import { getCurrentUser } from "@/server/auth/current-user";
import { ProfileForm } from "./ProfileForm";
import { TwoFactorSettings } from "./TwoFactorSettings";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">Profile</h1>
      <p className="mb-8 text-sm text-muted">Manage your account details and security.</p>

      <div className="max-w-md space-y-6">
        <ProfileForm initialName={user.name} email={user.email} twoFactorEnabled={user.twoFactorEnabled} />
        <TwoFactorSettings initialEnabled={user.twoFactorEnabled} />
      </div>
    </div>
  );
}
