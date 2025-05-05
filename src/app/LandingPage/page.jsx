"use client";
import React from "react";

import { useRouter } from "next/navigation";
import NavbarLanding from "../../components/Layout/NavbarLanding";

function Page() {
  const router = useRouter();
  return (
    <div>
      <NavbarLanding />
    </div>
  );
}

export default Page;
