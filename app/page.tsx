import Link from 'next/link';
import { ArrowRight, ShieldCheck, TrendingUp, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800/50 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">FinAI Advisor</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-medium bg-white text-slate-950 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
              Comenzar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Inteligencia Artificial Financiera</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Tu camino hacia la <br /> libertad financiera.
          </h1>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            Un asesor personal disponible 24/7. Analiza tu salud financiera, recibe recomendaciones personalizadas y construye un futuro sólido paso a paso.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="group flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
              Empezar ahora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-all border border-slate-700">
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            {
              icon: ShieldCheck,
              title: "Seguridad Primero",
              desc: "Tus datos están encriptados y protegidos. Tu privacidad es nuestra prioridad absoluta."
            },
            {
              icon: Zap,
              title: "Análisis Instantáneo",
              desc: "Recibe feedback inmediato sobre tus gastos, ahorros e inversiones con tecnología de punta."
            },
            {
              icon: TrendingUp,
              title: "Crecimiento Sostenible",
              desc: "Estrategias a largo plazo diseñadas para maximizar tu patrimonio sin riesgos innecesarios."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
