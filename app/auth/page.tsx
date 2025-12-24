import { TelegramLoginButton } from "@/components/TelegramLoginButton";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          LetsForms
        </h1>
        <p className="text-xl text-white/80 mb-12">
          Вход через Telegram
        </p>

        <TelegramLoginButton />

        <p className="text-sm text-white/60 mt-8">
          Один клик — и вы внутри
        </p>
      </div>
    </div>
  );
}