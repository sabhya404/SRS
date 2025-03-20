"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();
  return (
    <div>
      <button
        onClick={() => {
          signIn("credentials", {
            email: "test2@xample.com",
            password: "Test@123",
          });

          router.push("/HomePage");
        }}
      >
        singn in
      </button>
    </div>
  );
}

export default Page;
