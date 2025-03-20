import { StateEffect, StateField } from "@codemirror/state";
import { Diagnostic } from "./diagnostics";

export const setDiagnosticsEffect = StateEffect.define<readonly Diagnostic[]>();

export const lintState = StateField.define<readonly Diagnostic[]>({
  create: () => [],
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setDiagnosticsEffect)) return effect.value;
    }
    return value;
  },
});
