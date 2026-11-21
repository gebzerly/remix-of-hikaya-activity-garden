import type { GameObject } from "@/lib/game-activities";

interface GameObjectIllustrationProps {
  object: GameObject;
  className?: string;
}

function Ornament({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="5" className="object-shine" />;
}

export function GameObjectIllustration({ object, className = "" }: GameObjectIllustrationProps) {
  const kind = object.kind;
  const svg = (() => {
    switch (kind) {
      case "car":
        return (
          <>
            <path className="object-fill" d="M18 55 27 33q3-7 10-7h36q7 0 11 7l10 22v16H18Z" />
            <path className="object-window" d="m37 32-7 18h27V32Zm25 0v18h25l-7-15q-1-3-5-3Z" />
            <circle className="object-wheel" cx="37" cy="71" r="11" />
            <circle className="object-wheel" cx="77" cy="71" r="11" />
            <Ornament x={25} y={57} />
          </>
        );
      case "hat":
        return (
          <>
            <path className="object-fill" d="M24 59q3-34 27-34t27 34H24Z" />
            <path className="object-fill" d="M20 58q31-8 64 0 6 2 5 8-1 6-10 7H24q-10-1-10-8 0-5 6-7Z" />
            <path className="object-detail" d="M34 46h33" />
            <Ornament x={51} y={40} />
          </>
        );
      case "cup":
        return (
          <>
            <path className="object-fill" d="M27 28h49l-5 49q-1 9-10 9H42q-9 0-10-9Z" />
            <path className="object-detail" d="M77 39h9q11 0 9 14-1 12-19 12" />
            <path className="object-detail" d="M35 36h31" />
            <Ornament x={44} y={48} />
          </>
        );
      case "banana":
        return (
          <>
            <path className="object-fill" d="M25 27q13 5 19 26 8 25 30 24 9-1 16-9-5 23-29 24-35 2-48-39-5-15 12-26Z" />
            <path className="object-detail" d="M26 27q-4 3-7 10m71 29-1 5" />
            <Ornament x={47} y={69} />
          </>
        );
      case "coat":
        return (
          <>
            <path className="object-fill" d="m38 25 13 8 13-8 16 10 13 47H58V61h-8v21H19l13-47Z" />
            <path className="object-detail" d="m38 25 13 17 13-17M51 42v18" />
            <circle className="object-button" cx="57" cy="51" r="2.5" />
            <Ornament x={30} y={58} />
          </>
        );
      case "ball":
        return (
          <>
            <circle className="object-fill" cx="52" cy="53" r="31" />
            <path className="object-detail" d="M24 39q24 8 54-1M25 67q24-8 54 0m-39-43q-5 28 1 60m28-60q-13 27-6 59" />
            <Ornament x={40} y={39} />
          </>
        );
      case "leaf":
        return (
          <>
            <path className="object-fill" d="M19 72Q18 29 78 24q8 46-44 58Z" />
            <path className="object-detail" d="M20 82q21-31 55-49m-34 33-2-19m20 3 9 2" />
            <Ornament x={60} y={37} />
          </>
        );
      case "book":
        return (
          <>
            <path className="object-fill" d="M19 29h31q9 0 13 7 5-7 13-7h11v52H76q-9 0-13 8-4-8-13-8H19Z" />
            <path className="object-detail" d="M63 37v48M27 40h23m-23 9h21m28-9h10m-10 9h10" />
            <Ornament x={36} y={68} />
          </>
        );
      case "balloon":
        return (
          <>
            <ellipse className="object-fill" cx="52" cy="44" rx="27" ry="34" />
            <path className="object-fill" d="m47 76 5 7 5-7Z" />
            <path className="object-detail" d="M52 83q10 12-1 21" />
            <path className="object-window" d="M39 28q-7 9-4 18" />
          </>
        );
      case "circle":
        return <circle className="object-fill" cx="52" cy="52" r="32" />;
      case "square":
        return <rect className="object-fill" x="21" y="21" width="62" height="62" rx="6" />;
      case "tree":
        return (
          <>
            <path className="object-fill" d="M44 59h17v30H44Z" />
            <circle className="object-fill" cx="52" cy="35" r="25" />
            <circle className="object-fill-alt" cx="34" cy="50" r="17" />
            <circle className="object-fill-alt" cx="69" cy="51" r="17" />
            <Ornament x={48} y={31} />
          </>
        );
      case "pencil":
        return (
          <>
            <g transform={object.size === "small" ? "rotate(42 52 52) scale(.72) translate(21 22)" : "rotate(42 52 52)"}>
              <rect className="object-fill" x="38" y="14" width="28" height="67" rx="8" />
              <path className="object-detail" d="M38 28h28m-28 8h28" />
              <path className="object-fill" d="m38 78 14 17 14-17Z" />
              <path className="object-wheel" d="m47 89 5 6 5-6Z" />
              <rect className="object-eraser" x="38" y="10" width="28" height="11" rx="5" />
            </g>
            <Ornament x={42} y={35} />
          </>
        );
      case "plate":
        return (
          <>
            <ellipse className="object-fill" cx="52" cy="61" rx="40" ry="23" />
            <ellipse className="object-window" cx="52" cy="60" rx="30" ry="15" />
            {Array.from({ length: object.count ?? 2 }, (_, index) => {
              const positions = object.count === 4 ? [30, 47, 63, 79] : [39, 66];
              const x = positions[index] ?? 52;
              return (
                <g key={x}>
                  <circle className="object-biscuit" cx={x} cy="54" r="8" />
                  <circle className="object-detail-fill" cx={x - 2} cy="52" r="1.3" />
                  <circle className="object-detail-fill" cx={x + 3} cy="57" r="1.3" />
                </g>
              );
            })}
          </>
        );
      case "ribbon":
        return (
          <>
            <path className="object-fill" d={object.size === "small" ? "M12 43h80v18H12z" : "M12 34h80v36H12z"} />
            <path className="object-detail" d="M25 36v32m54-32v32" />
            <path className="object-detail" d="m19 51 7-5v10Zm66 0 7-5v10Z" />
            <Ornament x={50} y={51} />
          </>
        );
      case "bag":
        return (
          <>
            <g transform={object.size === "small" ? "scale(.72) translate(20 20)" : undefined}>
              <path className="object-fill" d="M30 42q0-9 10-9h24q10 0 10 9v39q0 7-8 7H38q-8 0-8-7Z" />
              <path className="object-detail" d="M41 34q0-15 11-15t11 15M39 47h26v18H39Zm4 18v11" />
              <Ornament x={49} y={53} />
            </g>
          </>
        );
      case "apple":
        return (
          <>
            <g transform={object.size === "small" ? "scale(.68) translate(24 25)" : undefined}>
              <path className="object-fill" d="M52 38q-30-20-37 9-6 27 16 39 9 5 21-3 12 8 21 3 23-12 17-39-7-29-38-9Z" />
              <path className="object-detail" d="M52 37q-5-15 6-23m-1 13q12-9 19-3" />
              <path className="object-fill-alt" d="M56 26q11-12 23-5-5 12-20 11Z" />
              <Ornament x={35} y={52} />
            </g>
          </>
        );
    }
  })();

  return (
    <svg
      className={`game-object object-color-${object.color}${(object.kind === "balloon" || object.kind === "tree") && object.size === "small" ? " object-size-small" : (object.kind === "balloon" || object.kind === "tree") && object.size === "large" ? " object-size-large" : ""} ${className}`}
      viewBox="0 0 104 104"
      role="img"
      aria-label={object.label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="var(--object-outline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {svg}
      </g>
    </svg>
  );
}

export function Mascot({ className = "" }: { className?: string }) {
  return (
    <svg className={`game-mascot ${className}`} viewBox="0 0 150 160" role="img" aria-label="تمسوح الصغير">
      <path d="M34 89q-12-9-20 2 2 14 19 12" className="mascot-tail" />
      <path d="M27 72q4-41 48-44 48-1 52 45l-6 44q-4 23-43 23-43 0-48-23Z" className="mascot-body" />
      <path d="M43 86q31 7 68 0 12-2 17 9-3 14-17 14H42q-14-1-17-12 4-12 18-11Z" className="mascot-muzzle" />
      <ellipse cx="58" cy="71" rx="5" ry="7" className="mascot-eye" />
      <ellipse cx="102" cy="71" rx="5" ry="7" className="mascot-eye" />
      <path d="M69 101q8 7 17 0" className="mascot-smile" />
      <path d="M35 48q6-18 17-22m57 25q-3-17-15-24" className="mascot-detail" />
      <path d="M43 135q-4 8-11 11m68-11q4 8 11 11" className="mascot-detail" />
      <path d="M33 52q-8 4-7 14m92-14q9 5 7 14" className="mascot-detail" />
      <circle cx="44" cy="96" r="4" className="mascot-cheek" />
      <circle cx="113" cy="96" r="4" className="mascot-cheek" />
    </svg>
  );
}