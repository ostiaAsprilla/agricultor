"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function RequestPasswordResetForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");

    try {
      const result = await authClient.requestPasswordReset({
        email: String(formData.get("email") ?? ""),
        redirectTo: "/restablecer-contrasena",
      });

      if (result.error) {
        setMessage(
          "No pudimos procesar la solicitud. Inténtalo de nuevo más tarde.",
        );
        return;
      }

      setMessage(
        "Si existe una cuenta con ese correo, recibirás instrucciones para cambiar la contraseña.",
      );
    } catch {
      setMessage(
        "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="mt-8 space-y-5">
      <div>
        <label className="block text-sm font-medium" htmlFor="email">
          Correo electrónico
        </label>
        <input
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      {message && (
        <p className="text-sm text-slate-700" role="status">
          {message}
        </p>
      )}
      <button
        className="w-full rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Un momento..." : "Enviar instrucciones"}
      </button>
      <p className="text-center text-sm text-slate-700">
        <Link
          className="font-semibold text-emerald-900 underline"
          href="/iniciar-sesion"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (token) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname,
      );
    }
  }, [token]);

  async function submit(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");

    if (password !== confirmation) {
      setMessage("Las contraseñas no coinciden.");
      setSuccess(false);
      return;
    }
    if (!token) {
      setMessage("El enlace no es válido. Solicita uno nuevo.");
      setSuccess(false);
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setMessage("El enlace venció o no es válido. Solicita uno nuevo.");
        return;
      }

      setMessage("Tu contraseña se actualizó. Ya puedes iniciar sesión.");
      setSuccess(true);
    } catch {
      setMessage(
        "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="mt-8 space-y-5">
      <div>
        <label className="block text-sm font-medium" htmlFor="password">
          Nueva contraseña
        </label>
        <input
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          id="password"
          maxLength={128}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="confirmation">
          Confirma la nueva contraseña
        </label>
        <input
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          id="confirmation"
          maxLength={128}
          minLength={8}
          name="confirmation"
          required
          type="password"
        />
      </div>
      {message && (
        <p
          className={success ? "text-sm text-emerald-900" : "text-sm text-red-800"}
          role={success ? "status" : "alert"}
        >
          {message}
        </p>
      )}
      {success ? (
        <Link
          className="block w-full rounded-xl bg-emerald-800 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-900"
          href="/iniciar-sesion"
        >
          Iniciar sesión
        </Link>
      ) : (
        <button
          className="w-full rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Un momento..." : "Guardar contraseña"}
        </button>
      )}
      {!success && (
        <p className="text-center text-sm text-slate-700">
          <Link
            className="font-semibold text-emerald-900 underline"
            href="/recuperar-contrasena"
          >
            Solicitar otro enlace
          </Link>
        </p>
      )}
    </form>
  );
}
