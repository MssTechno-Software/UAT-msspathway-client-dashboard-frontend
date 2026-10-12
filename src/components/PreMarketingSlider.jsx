import { useState } from "react";
import { FaLinkedin, FaGithub, FaRegThumbsUp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import {
  FiMail,
  FiUsers,
  FiMessageCircle,
  FiGlobe,
  FiMic,
  FiCheck,
  FiPlay,
  FiPause,
  FiSend,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";

const DURATION = 8500;

// Creates reusable animation styles with name, delay, and duration.
const A = (n, at = 0, d = 0.5) => ({
  animation: `${n} ${d}s ${at}s both`,
});

// Reusable status pill for off/on states.
const Pill = ({ children, ok }) => (
  <span
    className={`block w-[92px] text-center text-xs font-bold rounded-full py-1.5 ${ok ? "bg-[#3f7a45] text-white" : "bg-[#e9e3dc] text-[#3d1a10]"}`}
  >
    {children}
  </span>
);

// Shows the initial state and switches to the completed state at the given time.
const Toggle = ({ at, off, on }) => (
  <span className="relative inline-flex">
    <span style={A("pm-hide", at, 0.25)}>
      {off}
    </span>
    <span
      className="absolute inset-0"
      style={A("pm-show", at, 0.4)}
    >
      {on}
    </span>
  </span>
);

// Creates a typing animation for text-based content.
const Type = ({
  text,
  at,
  className = "",
}) => (
  <span
    className={`inline-block overflow-hidden whitespace-nowrap align-bottom ${className}`}
    style={{
      animation: `pm-type ${text.length * 0.03}s ${at}s steps(${text.length}) both`,
    }}
  >
    {text}
  </span>
);

// Reusable application-style window wrapper.
const Win = ({
  icon: I,
  title,
  color,
  children,
  expanded,
  onExpand,
}) => (
  <div
    className={`relative w-full rounded-2xl bg-white text-[#3d1a10] shadow-2xl overflow-hidden transition-all duration-500 ${expanded ? "max-w-3xl" : "max-w-md"}`}
    style={A("pm-up", 0.1)}
  >

    {/* Window header */}
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f4f0ea] border-b border-[#e7e0d8]">
      <span className="flex gap-1.5">
        <i className="w-2.5 h-2.5 rounded-full bg-[#e57373]" />
        <i className="w-2.5 h-2.5 rounded-full bg-[#f2c14e]" />
        <i className="w-2.5 h-2.5 rounded-full bg-[#7bc47f]" />
      </span>
      <I
        size={15}
        style={{ color }}
        className="ml-2"
      />
      <span className="text-xs font-semibold">
        {title}
      </span>

      {/* Expand / Collapse */}
      <button
        type="button"
        onClick={onExpand}
        aria-label={expanded ? "Collapse card" : "Expand card"}
        title={expanded ? "Collapse" : "Expand"}
        className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-[#3d1a10] hover:bg-black/5 transition-all duration-200 hover:scale-105"
      >
        {expanded ? (
          <FiMinimize2 size={15} />
        ) : (
          <FiMaximize2 size={15} />
        )}
      </button>
    </div>

    {/* Card content */}
    <div
      className={`p-4 space-y-2.5 transition-all duration-500 ${expanded ? "md:p-6 lg:p-8" : ""}`}
    >
      {children}
    </div>
  </div>
);

// Reusable row component.
const Row = ({
  icon: I,
  color = "#3f7a45",
  label,
  sub,
  at,
  off,
  on,
  delay = 0,
}) => (
  <div
    className="flex items-center gap-3 rounded-xl border border-[#e7e0d8] bg-[#faf8f5] px-3 py-2.5"
    style={A("pm-up", delay)}
  >
    <I
      size={22}
      style={{ color }}
    />
    <div className="flex-1 leading-tight">
      <div className="text-sm font-semibold">
        {label}
      </div>
      <div className="text-[11px] text-[#7a6a62]">
        {sub}
      </div>
    </div>
    <Toggle
      at={at}
      off={<Pill>{off}</Pill>}
      on={<Pill ok>✓ {on}</Pill>}
    />
  </div>
);

// Reusable recruiter conversation layout.
const Chat = ({ items }) => (
  <div className="space-y-2">
    {items.map(([q, a], i) => (
      <div
        key={q}
        className="space-y-1.5"
      >
        <div
          className="max-w-[78%] rounded-2xl rounded-bl-sm bg-[#f1ece5] px-3 py-2 text-[13px]"
          style={A("pm-up", i * 2)}
        >
          <b>Recruiter:</b> {q}
        </div>
        <div
          className="max-w-[82%] ml-auto rounded-2xl rounded-br-sm bg-[#3f7a45] text-white px-3 py-2 text-[13px]"
          style={A("pm-up", i * 2 + 0.9)}
        >
          {a}
        </div>
      </div>
    ))}
  </div>
);

// Reusable email row.
const Mail = ({
  from,
  subj,
  label,
  at,
  out,
}) => (
  <div
    className="flex items-center gap-3 rounded-lg border border-[#e7e0d8] px-3 py-2 overflow-hidden"
    style={
      out
        ? A("pm-out", out, 0.5)
        : undefined
    }
  >
    <span className="w-7 h-7 rounded-full bg-[#e4eee3] text-[#3f7a45] text-xs font-bold flex items-center justify-center">
      {from[0]}
    </span>
    <div className="flex-1 leading-tight min-w-0">
      <div className="text-[13px] font-semibold truncate">
        {from}
      </div>
      <div className="text-[11px] text-[#7a6a62] truncate">
        {subj}
      </div>
    </div>
    {label && (
      <span
        className="text-[10px] font-bold bg-[#3f7a45] text-white rounded px-2 py-0.5"
        style={A("pm-show", at)}
      >
        {label}
      </span>
    )}
  </div>
);

// Main scene data.
const scenes = [
  {
    tag: "01 · PROFESSIONAL PRESENCE",
    title: "Build a responsive LinkedIn presence",
    goal: "A profile that stays active, credible and responsive.",
    bg: "#3f7a45",
    view: (expanded, onExpand) => (
      <Win
        icon={FaLinkedin}
        title="LinkedIn"
        color="#0a66c2"
        expanded={expanded}
        onExpand={onExpand}
      >
        <Row
          icon={FiMail}
          label="Account setup"
          sub="Delegated email"
          off="Set primary"
          on="Primary"
          at={1}
        />
        <Row
          icon={FiUsers}
          label="Connections"
          sub="Relevant recruiters"
          off="Connect"
          on="Connected"
          at={2.6}
          delay={0.15}
        />
        <Row
          icon={FaRegThumbsUp}
          label="Daily activity"
          sub="Like relevant posts"
          off="Like"
          on="Liked"
          at={4.2}
          delay={0.3}
        />
        <Row
          icon={FiMessageCircle}
          label="Response time"
          sub="Recruiter message"
          off="Reply"
          on="Replied"
          at={5.8}
          delay={0.45}
        />
      </Win>
    ),
  },

  {
    tag: "02 · EMAIL DISCIPLINE",
    title: "Keep the inbox under control",
    goal: "Organize what matters, remove what does not.",
    bg: "#3d1a10",
    view: (expanded, onExpand) => (
      <Win
        icon={SiGmail}
        title="Inbox"
        color="#d93025"
        expanded={expanded}
        onExpand={onExpand}
      >
        <Mail
          from="Recruiter · TechCorp"
          subj="Interview invite"
          label="Recruiters"
          at={1}
        />
        <Mail
          from="Weekly Newsletter"
          subj="Top 10 deals this week"
          out={3}
        />
        <Mail
          from="Recruiter · Startup X"
          subj="Follow-up call"
          label="Follow-ups"
          at={1.8}
        />
        <Mail
          from="Promotions"
          subj="50% off, today only"
          out={3.5}
        />
        <div
          className="rounded-lg bg-[#e4eee3] text-[#3f7a45] text-xs font-bold px-3 py-2.5"
          style={A("pm-up", 4.8)}
        >
          ✓ Filter created: newsletters &amp; promotions skip the inbox
        </div>
      </Win>
    ),
  },

  {
    tag: "02 · COMMUNICATION",
    title: "Elevator pitch",
    goal: "Introduce yourself clearly, without overloading the listener.",
    bg: "#3f7a45",
    view: (expanded, onExpand) => (
      <Win
        icon={FiMic}
        title="Your pitch"
        color="#3f7a45"
        expanded={expanded}
        onExpand={onExpand}
      >
        {[
          [
            "1 · Who you are",
            "Hi, I'm [Name], a [role].",
            0.6,
          ],
          [
            "2 · What you know",
            "[X years] in [skills]. Recently I [result].",
            2.3,
          ],
          [
            "3 · Why it matters",
            "Looking for [role]. Let's discuss my fit.",
            4.4,
          ],
        ].map(([c, t, at]) => (
          <div
            key={c}
            className="rounded-xl bg-[#faf8f5] border border-[#e7e0d8] p-3"
            style={A("pm-up", at - 0.3)}
          >
            <div className="text-[10px] font-bold tracking-[2px] text-[#3f7a45] mb-1">
              {c.toUpperCase()}
            </div>
            <Type
              text={t}
              at={at}
              className="text-sm max-w-full"
            />
          </div>
        ))}
      </Win>
    ),
  },

  {
    tag: "05 · PROFESSIONAL PROOF",
    title: "Keep your professional links ready",
    goal: "Current, consistent and easy to share.",
    bg: "#3d1a10",
    view: (expanded, onExpand) => (
      <Win
        icon={FiGlobe}
        title="Your three assets"
        color="#3f7a45"
        expanded={expanded}
        onExpand={onExpand}
      >
        <Row
          icon={FaLinkedin}
          color="#0a66c2"
          label="LinkedIn"
          sub="Photo, headline, About"
          off="Update"
          on="Ready"
          at={1.2}
        />
        <Row
          icon={FaGithub}
          color="#24292f"
          label="GitHub"
          sub="Pinned repos + README"
          off="Update"
          on="Ready"
          at={2.8}
          delay={0.15}
        />
        <Row
          icon={FiGlobe}
          label="Portfolio"
          sub="Live links + contact"
          off="Update"
          on="Ready"
          at={4.4}
          delay={0.3}
        />
        <div
          className="rounded-lg bg-[#e4eee3] text-[#3f7a45] text-xs font-bold px-3 py-2.5"
          style={A("pm-up", 5.8)}
        >
          ✓ All links are current and easy to share
        </div>
      </Win>
    ),
  },

  {
    tag: "03 · COMPENSATION LANGUAGE",
    title: "Understand the terminology",
    goal: "Know these terms before discussing an opportunity.",
    bg: "#3f7a45",
    view: (expanded, onExpand) => (
      <Win
        icon={FiMail}
        title="Offer terms"
        color="#3f7a45"
        expanded={expanded}
        onExpand={onExpand}
      >
        <div className="grid grid-cols-2 gap-2">
          {[
            ["FTE", "Full-time equivalent"],
            ["C2H", "Contract-to-hire"],
            ["C2C", "Contract to contract"],
            ["CTC", "Cost to Company"],
            ["Fixed", "Fixed portion"],
            ["Variable", "Variable component"],
            ["Gross", "Before deductions"],
            ["Net", "After deductions"],
          ].map(([a, b], i) => (
            <div
              key={a}
              className="rounded-lg border border-[#e7e0d8] bg-[#faf8f5] px-3 py-2"
              style={A("pm-show", 0.4 + i * 0.4)}
            >
              <div className="text-sm font-extrabold text-[#3f7a45]">
                {a}
              </div>
              <div className="text-[11px] text-[#7a6a62]">
                {b}
              </div>
            </div>
          ))}
        </div>
        <div
          className="rounded-lg bg-[#f1e4de] text-xs font-semibold px-3 py-2.5"
          style={A("pm-up", 4.2)}
        >
          Tip: confirm Gross or Net, and Fixed or CTC.
        </div>
      </Win>
    ),
  },

  {
    tag: "06 · INTERVIEW READINESS",
    title: "Start-up & relocation questions",
    goal: "Keep it positive, specific and clear.",
    bg: "#3d1a10",
    view: (expanded, onExpand) => (
      <Win
        icon={FiMessageCircle}
        title="Recruiter call"
        color="#3f7a45"
        expanded={expanded}
        onExpand={onExpand}
      >
        <Chat
          items={[
            [
              "Why a start-up?",
              "I enjoy fast-paced environments where I own work end to end.",
            ],
            [
              "Are you open to relocation?",
              "Open to relocating to [city] within [timeframe].",
            ],
          ]}
        />
      </Win>
    ),
  },

  {
    tag: "07 · RECRUITER CONVERSATIONS",
    title: "Questions recruiters commonly ask",
    goal: "A short, honest answer for each.",
    bg: "#3f7a45",
    view: (expanded, onExpand) => (
      <Win
        icon={FiMessageCircle}
        title="Recruiter call"
        color="#3f7a45"
        expanded={expanded}
        onExpand={onExpand}
      >
        <Chat
          items={[
            [
              "Tell me about yourself",
              "My elevator pitch: who, what, why this role.",
            ],
            [
              "Why a change?",
              "Growth and new challenges, never criticism.",
            ],
            [
              "When can you start?",
              "My notice period is [X], plainly.",
            ],
            [
              "Salary expectations?",
              "Fixed, Variable, CTC. Gross vs Net.",
            ],
          ]}
        />
      </Win>
    ),
  },

  {
    tag: "08 · QUICK CHECK",
    title: "Before every recruiter call",
    goal: "Run this list so you always show up ready.",
    bg: "#3d1a10",
    view: (expanded, onExpand) => (
      <Win
        icon={FiCheck}
        title="Checklist"
        color="#3f7a45"
        expanded={expanded}
        onExpand={onExpand}
      >
        {[
          "LinkedIn current, delegated email primary",
          "Inbox labeled, cleaned, filtered",
          "Start-up and relocation answers ready",
          "Availability and notice period clear",
          "Elevator pitch practised out loud",
          "LinkedIn, GitHub, portfolio links ready",
          "Fixed, Variable, CTC, Gross, Net clear",
          "Thank-you message ready",
        ].map((t, i) => (
          <div
            key={t}
            className="flex items-center gap-3 text-[13px]"
          >
            <Toggle
              at={0.5 + i * 0.75}
              off={
                <i className="block w-5 h-5 rounded border-2 border-[#cfc6bd]" />
              }
              on={
                <i className="w-5 h-5 rounded bg-[#3f7a45] text-white flex items-center justify-center">
                  <FiCheck size={13} />
                </i>
              }
            />
            {t}
          </div>
        ))}
      </Win>
    ),
  },

  {
    tag: "AFTER THE TECHNICAL INTERVIEW",
    title: "Close the conversation professionally",
    goal: "Send a concise thanks message.",
    bg: "#3f7a45",
    view: (expanded, onExpand) => (
      <Win
        icon={SiGmail}
        title="New message"
        color="#d93025"
        expanded={expanded}
        onExpand={onExpand}
      >
        <div className="text-[12px] text-[#7a6a62] border-b border-[#e7e0d8] pb-1.5">
          To:{" "}
          <b className="text-[#3d1a10]">
            [Recruiter name]
          </b>
          <br />
          Subject:{" "}
          <b className="text-[#3d1a10]">
            Thank you · [Role] interview
          </b>
        </div>
        <div className="text-[13px] leading-6 min-h-[120px]">
          <Type
            text="Hi [Recruiter name],"
            at={0.5}
          />
          <br />
          <Type
            text="Thank you for your time today. I enjoyed the"
            at={1.5}
          />
          <br />
          <Type
            text="technical conversation and remain very interested."
            at={3}
          />
          <br />
          <Type
            text="Best regards, [Your name]"
            at={4.6}
          />
        </div>
        <Toggle
          at={6.2}
          off={
            <span className="flex items-center gap-2 rounded-full bg-[#3f7a45] text-white text-xs font-bold px-5 py-2 w-[110px] justify-center">
              <FiSend size={13} />
              Send
            </span>
          }
          on={
            <span className="flex items-center justify-center rounded-full bg-[#e4eee3] text-[#3f7a45] text-xs font-bold px-5 py-2 w-[110px]">
              ✓ Sent
            </span>
          }
        />
      </Win>
    ),
  },
];

// Key points displayed on the left side.
const POINTS = [
  [
    "Set the delegated email as primary",
    "Connect with relevant recruiters",
    "Like and post every day, stay consistent",
    "Check and reply to messages daily",
  ],

  [
    "Create labels: Recruiters, Interviews, Follow-ups",
    "Delete old notifications and promotions",
    "Filter out newsletters and unwanted senders",
  ],

  [
    "Who you are: name and current role",
    "What you do: core skills and strengths",
    "Why it matters: link it to the opportunity",
  ],

  [
    "LinkedIn: photo, headline, About section",
    "GitHub: pin best repos, add READMEs",
    "Portfolio: best projects, live links, contact",
  ],

  [
    "Know FTE, C2H, C2C and CTC",
    "Know Fixed, Variable, Gross and Net",
    "Always confirm Gross vs Net, Fixed vs CTC",
  ],

  [
    "Start-up: link it to ownership and learning",
    "Relocation: clear yes / no / conditional",
    "Always give a professional reason",
  ],

  [
    "Prepare a short, honest answer for each",
    "Never criticize a current employer",
    "Know your Fixed, Variable and CTC",
  ],

  [
    "Profile, inbox, links and pitch ready",
    "Answers and compensation terms clear",
    "Thank-you message ready to send",
  ],

  [
    "Send it right after the technical interview",
    "Keep it concise and professional",
    "Restate your interest in the role",
  ],
];

function PreMarketingSlider() {
  // Track the selected scene and whether automatic playback is running.
  const [active, setActive] = useState(0);
  // Controls both the play/pause button and the active progress animation.
  const [playing, setPlaying] = useState(true);
  // This state stays true when the scene changes.
  const [expanded, setExpanded] = useState(false);
  const s = scenes[active];
  // Next scene.
  // Advance to the next scene and wrap around after the final scene.
  // DO NOT reset expanded here.
  const next = () => {
    setActive((a) => (a + 1) % scenes.length);
  };
  // Expand / collapse only the right-side card.
  const toggleExpanded = () => {
    setExpanded((value) => !value);
  };
  return (
    <div className="w-full mb-8">
      <style>{`
        @keyframes pm-fill {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        @keyframes pm-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @keyframes pm-show {
          from {
            opacity: 0;
            transform: scale(.85);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @keyframes pm-hide {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes pm-type {
          from {
            max-width: 0;
          }
          to {
            max-width: 100%;
          }
        }
        @keyframes pm-out {
          from {
            opacity: 1;
            max-height: 60px;
          }
          to {
            opacity: 0;
            max-height: 0;
            padding-top: 0;
            padding-bottom: 0;
            border-width: 0;
            transform: translateX(40px);
          }
        }
      `}</style>

      {/* Main outer container */}
      <div
        className="relative overflow-hidden rounded-3xl text-white shadow-md transition-colors duration-700"
        style={{
          background: s.bg,
        }}
      >

        {/* Top heading */}
        <div className="absolute top-5 left-8 md:left-12 text-[11px] font-bold tracking-[3px] text-white/60 z-10">
          MSSTECHNO · PRE-MARKETING READINESS GUIDE
        </div>

        {/* Main content */}
        <div
          key={active}
          className={`relative z-10 grid gap-8 items-center px-8 md:px-12 pt-16 pb-24 min-h-[500px] transition-all duration-500 ${expanded ? "grid-cols-1" : "md:grid-cols-[1fr_1.1fr]"}`}
        >

          {/* LEFT SIDE */}
          {!expanded && (
            <div>
              <div
                className="text-[11px] font-bold tracking-[3px] text-white/70 mb-3"
                style={A("pm-up", 0)}
              >
                {s.tag}
              </div>
              <h2
                className="text-3xl lg:text-4xl font-bold leading-tight"
                style={A("pm-up", 0.15, 0.6)}
              >
                {s.title}
              </h2>
              <p
                className="mt-3 text-white/80 text-base max-w-md"
                style={A("pm-up", 0.4, 0.6)}
              >
                {s.goal}
              </p>
              <ul className="mt-6 space-y-3 border-t border-white/20 pt-5">
                {POINTS[active].map((pt, i) => (
                  <li
                    key={pt}
                    className="flex items-start gap-3 text-[15px] text-white/95"
                    style={A("pm-up", 0.8 + i * 0.6)}
                  >
                    <span className="w-5 h-5 mt-0.5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <FiCheck size={12} />
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* RIGHT CARD */}
          <div
            className={`flex justify-center w-full transition-all duration-500 ${expanded ? "px-2 md:px-8 lg:px-16" : ""}`}
          >
            {s.view(expanded, toggleExpanded)}
          </div>
        </div>

        {/* Bottom slider controls */}
        <div className="absolute z-20 left-0 right-0 bottom-0 px-6 md:px-10 pb-5 flex items-center gap-4">

          {/* Play / pause */}
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Play"}
            className="w-9 h-9 shrink-0 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            {playing ? (
              <FiPause size={14} />
            ) : (
              <FiPlay size={14} />
            )}
          </button>

          {/* Progress indicators */}
          <div className="flex-1 flex gap-1.5">
            {scenes.map(
              (sc, i) => (
                <button
                  key={sc.tag}
                  type="button"
                  onClick={() => setActive(i)}
                  title={sc.title}
                  className="flex-1 py-2"
                >
                  <div className="h-1.5 rounded-full bg-white/25 overflow-hidden">
                    <div
                      className="h-full bg-white"
                      style={
                        i < active
                          ? {
                            width:
                              "100%",
                          }
                          : i === active
                            ? {
                              animation: `pm-fill ${DURATION}ms linear forwards`,
                              animationPlayState:
                                playing
                                  ? "running"
                                  : "paused",
                            }
                            : {
                              width: 0,
                            }
                      }
                      onAnimationEnd={
                        i === active
                          ? next
                          : undefined
                      }
                    />
                  </div>
                </button>
              )
            )}
          </div>

          {/* Counter */}
          <span className="text-xs font-bold text-white/70 w-10 text-right">
            {active + 1}/
            {scenes.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PreMarketingSlider;
