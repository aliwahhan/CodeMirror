import { GutterMarker, gutter } from "@codemirror/view";
import { StateField, RangeSet } from "@codemirror/state";
import { setDiagnosticsEffect } from "./lintState";

class LintGutterMarker extends GutterMarker {
  constructor(private severity: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = `cm-lint-marker cm-lint-marker-${this.severity}`;
    return span;
  }
}

export const lintGutterMarkers = StateField.define<RangeSet<GutterMarker>>({
  create: () => RangeSet.empty,
  update(markers, tr) {
    markers = markers.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setDiagnosticsEffect)) {
        const diagnostics = effect.value; // 
        const newMarkers = diagnostics.map((d) =>
          new LintGutterMarker(d.severity).range(d.from)
        ); 
        markers = RangeSet.of(newMarkers);
      }
    }
    return markers;
  },
});

export const lintGutter = gutter({
  class: "cm-gutter-lint",
  markers: (view) => view.state.field(lintGutterMarkers),
});
