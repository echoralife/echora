export default function ArchitecturalPlan() {
  return (
    <figure className="memory-plan">
      <header className="memory-plan-header">
        <span>current memory</span>
        <span>seven rooms / twelve changes</span>
      </header>

      <div className="memory-plan-field">
        <svg viewBox="0 0 760 520" role="img" aria-labelledby="plan-title plan-description">
          <title id="plan-title">Echora&apos;s current floor plan</title>
          <desc id="plan-description">
            Seven connected rooms drawn in black. The newest retained feature in the echo gallery is blue.
          </desc>

          <g className="plan-connections">
            <path d="M230 248 H292 V144 H310" />
            <path d="M230 266 H355 V372" />
            <path d="M320 391 H355" />
            <path d="M515 385 H545" />
            <path d="M545 313 H500 V252 H512" />
            <path d="M112 409 H135" />
          </g>

          <g className="plan-room plan-room-one">
            <path d="M78 196 H230 V300 H78 Z" />
            <path className="plan-feature" d="M132 196 V211 M166 196 V211 M128 211 H170" />
            <text x="92" y="281">threshold</text>
          </g>

          <g className="plan-room plan-room-two">
            <path d="M198 55 H396 V144 H310 M270 144 H198 Z" />
            <text x="214" y="81">echo gallery</text>
          </g>

          <g className="plan-room plan-room-three">
            <path d="M512 86 H690 V210 H620 M582 210 H512 Z" />
            <path className="plan-feature" d="M675 112 H690 M675 128 H690 M675 144 H690 M675 160 H690" />
            <text x="528" y="190">borrowed wall</text>
          </g>

          <g className="plan-room plan-room-four">
            <path d="M545 275 H690 V400 H545 V342 M545 310 V275" />
            <text x="561" y="381">second landing</text>
          </g>

          <g className="plan-room plan-room-five">
            <path d="M355 330 H515 V445 H355 V405 M355 370 V330" />
            <text x="371" y="425">room behind</text>
          </g>

          <g className="plan-room plan-room-six">
            <path d="M135 342 H320 V440 H135 V392 M135 365 V342" />
            <text x="151" y="420">false exterior</text>
          </g>

          <g className="plan-room plan-room-seven">
            <path d="M45 350 H112 V474 H45 Z" />
            <path className="plan-feature" d="M55 450 H72 V437 H84 V424 H96 V411 H112" />
            <text x="55" y="369">unlit</text>
            <text x="55" y="384">stair</text>
          </g>

          <g className="plan-latest">
            <path d="M230 72 H364 V127 H230 Z" />
            <path d="M246 84 H348 V115 H246 Z" />
          </g>

          <g className="plan-center-mark" aria-hidden="true">
            <path d="M378 237 h12 M384 231 v12" />
          </g>
        </svg>
      </div>

      <figcaption>
        <span>the latest return is blue.</span>
        <a href="/commits#the-gallery-kept-the-return">the gallery kept the return</a>
      </figcaption>
    </figure>
  );
}
