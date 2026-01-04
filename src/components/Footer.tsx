import { Linkedin, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="bg-[#051426] text-neutral-400 border-t border-white/10 py-12 relative overflow-hidden">
            {/* Marca D'água - Canto Inferior Direito - Masonic G (PNG) */}
            <div className="absolute bottom-4 right-4 w-[110px] h-[110px] opacity-50 pointer-events-none mix-blend-overlay">
                <img
                    src="/masonic_g.png"
                    alt=""
                    className="w-full h-full object-contain invert grayscale"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">

                    <div className="text-center md:text-left">
                        <div className="w-28 mx-auto md:mx-0 mb-4">
                            <img
                                src="/logo.png"
                                alt="ATVEZA"
                                className="w-full h-auto opacity-90"
                            />
                        </div>
                        <p className="text-sm">Inteligência Operacional em Suporte B2B.</p>
                        <p className="text-sm mt-1">&copy; 2025 ATVEZA Method ∴</p>
                        <p className="text-xs mt-2 text-neutral-600">
                            ATVEZA SERVICOS EM TECNOLOGIA LTDA <br />
                            CNPJ: 48.761.773/0001-17
                        </p>

                        <div className="mt-4">
                            <Link to="/privacy" className="text-xs text-neutral-500 hover:text-blue-400 transition-colors underline decoration-neutral-700 underline-offset-4">
                                Política de Privacidade
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <a href="https://www.linkedin.com/in/athossouza/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition">
                            <Linkedin className="w-6 h-6" />
                        </a>
                        <a href="https://www.instagram.com/atveza/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 transition">
                            <Instagram className="w-6 h-6" />
                        </a>
                        <a href="https://www.youtube.com/@ATVEZATechnology" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition">
                            <Youtube className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
