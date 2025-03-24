"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import NavbarLanding from "../../components/Layout/NavbarLanding";

function Page() {
  const router = useRouter();
  return (
    <div>
      <NavbarLanding />
      <button
        onClick={() => {
          signIn("credentials", {
            email: "agarwalsabhya44@gmail.com",
            password: "123123",
          });

          router.push("/HomePage");
        }}
      >
        sign in
      </button>
    </div>
  );
}

export default Page;
