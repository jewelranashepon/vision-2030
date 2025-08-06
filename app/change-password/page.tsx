// app/change-password/page.tsx
export const dynamic = "force-dynamic"; // <-- Required to prevent static generation

import { Suspense } from "react";
import ChangePasswordPage from "./ChangePasswordPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChangePasswordPage />
    </Suspense>
  );
}
