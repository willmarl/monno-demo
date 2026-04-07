"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLogin } from "../hooks";

export default function OAuthButtons() {
  const loginMutation = useLogin();

  function handleOAuth() {
    loginMutation.mutate({ username: "bob", password: "demo" });
    toast.info("Demo mode — logging in as bob");
  }

  return (
    <section aria-label="Sign in with a third-party provider">
      <ul className="space-y-3 list-none p-0 m-0">
        <li>
          <Button
            variant="outline"
            className="w-full font-medium"
            onClick={handleOAuth}
            disabled={loginMutation.isPending}
          >
            <FcGoogle className="h-5 w-5" aria-hidden="true" />
            Google
          </Button>
        </li>

        <li>
          <Button
            variant="outline"
            className="w-full font-medium"
            onClick={handleOAuth}
            disabled={loginMutation.isPending}
          >
            <FaGithub className="h-5 w-5" aria-hidden="true" />
            GitHub
          </Button>
        </li>
      </ul>
    </section>
  );
}
