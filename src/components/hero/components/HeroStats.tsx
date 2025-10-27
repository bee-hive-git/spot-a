"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface HeroStatsProps {
  isVisible: boolean;
  className?: string;
  id?: string;
}

const HeroStats: React.FC<HeroStatsProps> = ({ isVisible, className = "", id }) => {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Sempre reseta primeiro para garantir que a animação rode novamente
      setShowStats(false);
      // Pequeno delay para a animação começar após o cubo estar posicionado
      const timer = setTimeout(() => {
        setShowStats(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Reset o estado quando não está mais visível (scroll reverso)
      setShowStats(false);
    }
  }, [isVisible]);

  const formatMillions = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0);
    }
    return num.toString();
  };

  return (
    <div 
      id={id}
      className={className}
    >
      {/* Estatísticas na parte superior */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 mb-12">
        {/* Empresas */}
        <div 
          className={`
            text-center transition-all duration-700 delay-300 ease-out
            ${showStats ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
          `}
        >
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            <AnimatedCounter
              from={0}
              to={125}
              duration={2500}
              prefix="+"
              trigger={showStats}
              formatNumber={(num) => num.toString().padStart(3, '0')}
            />
          </div>
          <div className="text-sm sm:text-base text-white/70 uppercase tracking-wider">
            EMPRESAS
          </div>
        </div>

        {/* Campanhas */}
        <div 
          className={`
            text-center transition-all duration-700 delay-500 ease-out
            ${showStats ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
          `}
        >
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            <AnimatedCounter
              from={0}
              to={400}
              duration={2500}
              prefix="+"
              trigger={showStats}
            />
          </div>
          <div className="text-sm sm:text-base text-white/70 uppercase tracking-wider">
            CAMPANHAS
          </div>
        </div>

        {/* Gerenciados */}
        <div 
          className={`
            text-center transition-all duration-700 delay-700 ease-out
            ${showStats ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
          `}
        >
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            <AnimatedCounter
              from={0}
              to={8000000}
              duration={2500}
              prefix="+"
              suffix="M"
              trigger={showStats}
              formatNumber={formatMillions}
            />
          </div>
          <div className="text-sm sm:text-base text-white/70 uppercase tracking-wider">
            GERENCIADOS
          </div>
        </div>
      </div>

      {/* Bloco de conteúdo centralizado (sem offset lateral do cubo) */}
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Conteúdo textual centralizado */}
        <div
          className={`
            max-w-2xl text-center transition-all duration-800 delay-900 ease-out mx-auto
            ${showStats ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-0'}
          `}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Como funciona?
          </h2>

          <p className="text-base sm:text-lg text-white/80 mb-8 leading-relaxed">
            Não basta atrair tráfego. O que você precisa é atrair as pessoas certas,
            no momento certo, com a mensagem certa, garantindo mais conversões e ROI.
          </p>

          <Link
            href="#vender"
            className={`
              group relative inline-flex h-12 sm:h-[52px] items-center justify-center rounded-[33.9px]
              bg-[linear-gradient(180deg,_#E5AC02_0.96%,_rgba(78,58,0,0.89)_100.96%)]
              sm:bg-[linear-gradient(180deg,_#000000_0.96%,_rgba(25,25,25,0.89)_100.96%)]
              shadow-[inset_0px_0px_11.2px_1.41px_#F3C53D]
              sm:shadow-[inset_0px_0px_4.42px_2.26px_#F3C53D]
              backdrop-blur-[17.6px] sm:backdrop-blur-[24px]
              px-6 sm:px-7 md:px-8 outline-none transition-all duration-500 delay-1100 ease-out mx-auto
              hover:brightness-110 hover:ring-2 hover:ring-[#F3C53D]/35 hover:border-transparent
              hover:bg-[linear-gradient(83.94deg,_#CA9700_-5.76%,_#765802_93.06%)]
              sm:hover:bg-[linear-gradient(83.94deg,_#CA9700_-5.76%,_#765802_93.06%)]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3C53D]/45 active:brightness-105
              ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            <span className="pointer-events-none select-none font-medium group-hover:font-bold whitespace-nowrap">Obter mais conversões</span>
            <ArrowRight className="absolute right-4 sm:right-6 top-1/2 h-[18px] w-[18px] sm:h-[20px] sm:w-[20px] -translate-y-1/2 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroStats;