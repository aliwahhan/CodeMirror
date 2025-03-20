import { Panel, showPanel, ViewUpdate, EditorView } from "@codemirror/view";
import { lintState } from "./lintState";

export class LintPanel implements Panel {
  dom: HTMLElement;

  constructor(view: EditorView) {
    this.dom = document.createElement("div");
    this.dom.className = "cm-lint-panel";
    this.update({ view } as ViewUpdate);
  }

  update(update: ViewUpdate) {
    const diagnostics = update.view.state.field(lintState);
    this.dom.innerHTML = diagnostics.length
      ? `Found ${diagnostics.length} error(errors)`
      : "Not Found Error";
  }

  static open(view: EditorView) {
    return new LintPanel(view);
  }
}

export const openLintPanel = (view: EditorView) => {
  view.dispatch({ effects: showPanel.of(LintPanel.open) });
  return true;
};
