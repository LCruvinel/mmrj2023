"use client";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Turnstile, { useTurnstile } from "react-turnstile";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [captchaWarning, setCaptchaWarning] = useState(false);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const turnstile = useTurnstile();
  const router = useRouter();
  const canBypassCaptcha = process.env.NODE_ENV !== "production";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const shouldBypassCaptcha = captchaError && canBypassCaptcha;

    if (!token && !shouldBypassCaptcha) {
      setCaptchaWarning(true);
      toast({
        title: "Captcha pendente",
        variant: "destructive",
        description: "Confirme o captcha para entrar.",
        duration: 4000,
      });
      return;
    }

    if (shouldBypassCaptcha) {
      toast({
        title: "Captcha indisponivel",
        description: "A continuar sem captcha em ambiente local.",
        duration: 3500,
      });
    }

    setCaptchaWarning(false);
    setLoading(true);

    try {
      const response = await fetch("/api/user/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        toast({
          title: "Erro",
          variant: "destructive",
          description: "Login name ou senha incorretos",
          duration: 5000,
        });
        return;
      }

      router.push("/admin/dashboard");
    } catch (error) {
      console.error(error);
      turnstile.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen lg:flex-row">
      <div className="flex items-center justify-center w-full h-1/2 lg:h-auto ">
        <Image
          src="/logo.webp"
          alt="Sign In"
          width={500}
          height={500}
          style={{ filter: "sepia(100%) hue-rotate(190deg) saturate(500%)" }}
          className="w-1/2"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-full gap-4 bg-blue-400 h-1/2 lg:h-auto ">
        <h1 className="text-4xl font-bold text-center text-white ">
          Entrar no
          <br />
          <span className="font-extrabold text-white ">Backoffice</span>
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full gap-4"
        >
          <Input
            disabled={loading}
            name="username"
            type="text"
            placeholder="Login name"
            className="rounded-xl w-[50%]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            disabled={loading}
            name="password"
            type="password"
            placeholder="Senha"
            className="rounded-xl w-[50%]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] px-8 py-2 bg-[#0070f3] rounded-2xl text-white font-light transition duration-200 ease-linear w-[50%] font-bold"
          >
            {loading && <Loader classProp="ml-2 w-6 h-6" />}
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <div className="w-[50%] min-h-[84px] flex items-center justify-center">
            <Turnstile
              sitekey="0x4AAAAAAAaieK38rD9jtI_y"
              theme="light"
              size="normal"
              onLoad={() => {
                setCaptchaLoaded(true);
                setCaptchaError(false);
              }}
              onError={() => {
                setCaptchaError(true);
                setCaptchaLoaded(false);
              }}
              onVerify={(token) => {
                setToken(token);
                setCaptchaWarning(false);
              }}
              onExpire={() => {
                setToken("");
              }}
            />
          </div>
          {!captchaLoaded && !captchaError && (
            <p className="w-[50%] text-xs text-blue-100 text-center">
              A carregar captcha...
            </p>
          )}
          {captchaError && (
            <p className="w-[50%] text-sm font-medium text-red-100 text-center">
              Nao foi possivel carregar o captcha. Atualize a pagina e desative bloqueadores de conteudo para este site.
            </p>
          )}
          {captchaError && canBypassCaptcha && (
            <p className="w-[50%] text-xs font-medium text-blue-100 text-center">
              Ambiente local detectado: pode entrar mesmo sem captcha.
            </p>
          )}
          {captchaWarning && (
            <p className="w-[50%] text-sm font-medium text-red-100 text-center">
              Confirme o captcha para entrar.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
