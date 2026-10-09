import { useEffect, useState } from "react";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { ExternalLink, CheckCircle } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  "Government Scheme":      "bg-[#3FC7E9]/15 text-[#0e7a92]",
  "Financial Support":      "bg-[#7CE25B]/15 text-[#2a7a10]",
  "Skill Development":      "bg-purple-100 text-purple-800",
  "Market Access":          "bg-amber-100 text-amber-800",
  "Craft Development":      "bg-orange-100 text-orange-800",
  "State Scheme":           "bg-[#E6429B]/15 text-[#a01565]",
  "Special Category Support": "bg-indigo-100 text-indigo-800",
};

function matchLevel(score: number): "high" | "medium" | "low" {
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

const MATCH_CONFIG = {
  high:   { border: "border-l-[#7CE25B]", badge: "bg-[#7CE25B]/20 text-[#2a7a10]", label: "High Match" },
  medium: { border: "border-l-[#3FC7E9]", badge: "bg-[#3FC7E9]/20 text-[#0e7a92]", label: "Medium Match" },
  low:    { border: "border-l-[#6B6860]", badge: "bg-[#E8E6E1] text-[#6B6860]",    label: "Low Match" },
};

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall("/opportunities").then(setOpportunities).catch(console.error).finally(() => setLoading(false));
  }, []);

  const recommended = opportunities.filter(o => o.relevance_score >= 3);
  const others = opportunities.filter(o => o.relevance_score < 3);

  const OppCard = ({ opp }: { opp: any }) => {
    const level = matchLevel(opp.relevance_score ?? 0);
    const cfg = MATCH_CONFIG[level];
    return (
      <div
        className={`bg-white border border-[#E8E6E1] border-l-4 ${cfg.border} rounded-2xl p-6 hover:shadow-lg hover:shadow-black/5 transition`}
      >
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div className="flex flex-wrap gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[opp.type] || "bg-[#E8E6E1] text-[#6B6860]"}`}>
              {opp.type}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        <h3
          className="text-base font-bold text-[#0B0B0F] mb-2 leading-snug"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {opp.title}
        </h3>
        <p className="text-sm text-[#6B6860] mb-4 leading-relaxed">{opp.description}</p>

        {/* Eligibility / relevance reasons */}
        {opp.relevance_reasons?.length > 0 && (
          <div className="mb-4 space-y-1">
            {opp.relevance_reasons.map((r: string, i: number) => (
              <p key={i} className="text-xs text-[#7CE25B] flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#7CE25B]" />{r}
              </p>
            ))}
          </div>
        )}

        {/* Benefits */}
        {opp.benefits?.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-[#6B6860] uppercase tracking-wider mb-2">Key Benefits</p>
            <ul className="space-y-1">
              {opp.benefits.map((b: string, i: number) => (
                <li key={i} className="text-sm text-[#0B0B0F] flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3FC7E9] mt-2 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E6E1]">
          <p className="text-[10px] text-[#6B6860]">Source: {opp.source}</p>
          <a
            href={opp.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-bold text-[#0B0B0F] hover:text-[#7CE25B] transition-colors"
          >
            Learn more <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <ArtisanLayout>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-[#0B0B0F]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Opportunities
        </h1>
        <p className="text-sm text-[#6B6860] mt-1">Govt. schemes &amp; funding for artisans</p>
        <div
          className="mt-3 h-[3px] w-20 rounded-full"
          style={{ background: "linear-gradient(90deg, #7CE25B, #3FC7E9, #E6429B)" }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-[#E8E6E1] border-l-4 border-l-[#E8E6E1] rounded-2xl p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-5 bg-[#E8E6E1] rounded-full w-24" />
                <div className="h-5 bg-[#E8E6E1] rounded-full w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-[#E8E6E1] rounded w-3/4" />
                <div className="h-3.5 bg-[#E8E6E1] rounded w-full" />
                <div className="h-3.5 bg-[#E8E6E1] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {recommended.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold text-[#0B0B0F] mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Recommended For You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommended.map(o => <OppCard key={o.id} opp={o} />)}
              </div>
            </section>
          )}
          {others.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold text-[#0B0B0F] mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                All Opportunities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {others.map(o => <OppCard key={o.id} opp={o} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </ArtisanLayout>
  );
}
