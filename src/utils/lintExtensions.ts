import { linter } from "@codemirror/lint";
import { myLanguageLinter } from "./myLanguageLinter";

export const myLanguageLinting = linter(myLanguageLinter);
