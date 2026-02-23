import { AccountProfile } from "../../../components/AccountProfile";

function SettingsRow({
  label,
  value,
  action
}: {
  label: string;
  value: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-500 truncate">{value}</p>
      </div>
      {action && (
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-neutral-500 hover:text-neutral-700"
        >
          {action}
        </button>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Account</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Manage your profile and preferences.
      </p>

      <AccountProfile
        name="John Doe"
        email="john@example.com"
        initials="J"
      />

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Preferences
        </h2>
        <div className="mt-2 divide-y divide-neutral-100">
          <SettingsRow
            label="Notifications"
            value="Push and email"
            action="Edit"
          />
          <SettingsRow
            label="Language"
            value="English"
            action="Change"
          />
          <SettingsRow
            label="Theme"
            value="System default"
            action="Change"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Account
        </h2>
        <div className="mt-2 divide-y divide-neutral-100">
          <SettingsRow label="Plan" value="Free" action="Upgrade" />
          <SettingsRow
            label="Connected accounts"
            value="None"
            action="Link"
          />
        </div>
      </section>

      <div className="mt-10">
        <button
          type="button"
          className="w-full rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-500 transition-colors hover:border-red-200 hover:text-red-500"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
