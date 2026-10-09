import { useEffect, useState } from "react";
import { apiCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";
import { Compass, ExternalLink, CheckCircle, Star } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  "Government Scheme": "bg-blue-100 text-blue-800",
  "Financial Support": "bg-green-100 text-green-800",
  "Skill Development": "bg-purple-100 text-purple-800",
  "Market Access": "bg-orange-100 text-orange-800",
  "Craft Development": "bg-yellow-100 text-yellow-800",
  "State Scheme": "bg-pink-100 text-pink-800",
  "Special Category Support": "bg-indigo-100 text-indigo-800",
};

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { apiCall("/opportunities").then(setOpportunities).catch(console.error).finally(() => setLoading(false)); }, []);

  const recommended = opportunities.filter(o => o.relevance_score >= 3);
  const others = opportunities.filter(o => o.relevance_score < 3);

  const OppCard = ({ opp }: { opp: any }) => (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition ${opp.relevance_score >= 3 ? "border-primary/30" : "border-gray-100"}`}>
      <div className="flex flex-wrap items-start gap-2 mb-4">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[opp.type] || "bg-gray-100 text-gray-700"}`}>{opp.type}</span>
        {opp.relevance_score >= 3 && (
          <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current" />Recommended for you
          </span>
        )}
      </div>

      <h3 className="text-lg font-extrabold text-gray-900 mb-2">{opp.title}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{opp.description}</p>

      {opp.relevance_reasons?.length > 0 && (
        <div className="mb-4 space-y-1">
          {opp.relevance_reasons.map((r: string, i: number) => (
            <p key={i} className="text-xs text-green-700 flex items-center font-medium">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />{r}
            </p>
          ))}
        </div>
      )}

      {opp.benefits?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Benefits</p>
          <ul className="space-y-1">
            {opp.benefits.map((b: string, i: number) => (
              <li key={i} className="text-sm text-gray-700 flex items-start">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />{b}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Source: {opp.source}</p>
        <a href={opp.url} target="_blank" rel="noreferrer"
          className="flex items-center text-primary text-sm font-bold hover:underline">
          Learn More <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );

  return (
    <ArtisanLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center"><Compass className="w-8 h-8 mr-3 text-primary" />Opportunities</h1>
        <p className="text-gray-500 mt-2">Government schemes, financial support, training, and market access — personalised for your craft and location.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-10">
          {recommended.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-primary fill-current" /> Recommended For You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommended.map(o => <OppCard key={o.id} opp={o} />)}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">All Opportunities</h2>
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
