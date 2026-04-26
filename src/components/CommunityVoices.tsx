import Squiggle from "./Squiggle";

const quotes = [
  {
    name: "Sarah M.",
    role: "Mom of 4 · Classical",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    quote:
      "I saved $340 on our full Year 3 curriculum cycle. This site pays for itself with one deal.",
  },
  {
    name: "Marcus & Beth",
    role: "Eclectic homeschool · TX",
    photo: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=200&q=80",
    quote:
      "Finally a deals site that knows the difference between Sonlight and Saxon. The methodology filter is gold.",
  },
  {
    name: "Priya K.",
    role: "Charlotte Mason · Year 6",
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80",
    quote:
      "Living books deals are usually impossible to find. I check this every morning with my coffee.",
  },
];

export default function CommunityVoices() {
  return (
    <section className="hsdf-section">
      <div className="hsdf-section-head">
        <h2>
          From the community
          <Squiggle />
        </h2>
        <p>Real homeschool families, real savings.</p>
      </div>
      <div className="hsdf-voices">
        {quotes.map((q) => (
          <figure key={q.name} className="hsdf-voice">
            <blockquote>&ldquo;{q.quote}&rdquo;</blockquote>
            <figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={q.photo} alt={`${q.name} avatar`} loading="lazy" />
              <div>
                <div className="name">{q.name}</div>
                <div className="role">{q.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
