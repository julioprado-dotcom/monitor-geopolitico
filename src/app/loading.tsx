export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] overflow-hidden">
      <h1
        className="text-4xl md:text-6xl font-bold text-white mb-4"
        style={{ fontFamily: 'Space Grotesk' }}
      >
        Monitor Geopolítico
      </h1>
      <div className="splash-card glass p-8 md:p-12 rounded-2xl max-w-2xl text-center">
        <div className="w-24 h-1 bg-[#00E5A0] mx-auto rounded-full neon-glow mb-6" />
        <p className="text-base md:text-lg text-slate-400 leading-relaxed">
          Un producto de inteligencia artificial de{' '}
          <span className="text-[#00E5A0] font-semibold">News Connect</span>.
          Analiza señales globales desechando la narrativa mercantilista de la Web,
          utilizando la óptica de las Epistemologías del Sur Global, todo visualizado
          bajo el diseño Meridian y el Sistema de Navegación por Foco Dinámico.
        </p>
      </div>
    </div>
  );
}
