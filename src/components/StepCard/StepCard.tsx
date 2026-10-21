import type { HowItWorksStep } from '../../types';

interface StepCardProps {
  step: HowItWorksStep;
  isLast: boolean;
}

export default function StepCard({ step, isLast }: StepCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
      {/* Step content */}
      <div className="flex-1 bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#C0392B] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {step.step}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{step.icon}</span>
              <h3 className="font-semibold text-[#1A1A1A]">{step.title}</h3>
            </div>
            <p className="text-sm text-[#5A5A5A] leading-relaxed">{step.description}</p>
          </div>
        </div>
      </div>

      {/* Connector arrow (hidden on last item and on mobile vertical layout) */}
      {!isLast && (
        <div className="hidden lg:flex items-center text-[#E8E4DC] text-2xl shrink-0">
          →
        </div>
      )}
    </div>
  );
}
