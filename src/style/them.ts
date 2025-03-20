
import createTheme from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

const CustomTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#1e1e1e",
    backgroundImage: "",
    foreground: "#d4d4d4",
    caret: "#569cd6",
    selection: "#264f78",
    selectionMatch: "#264f78",
    lineHighlight: "#2d2d2d",
    gutterBorder: "1px solid #ffffff10",
    gutterBackground: "#1e1e1e",
    gutterForeground: "#858585",
  },
  styles: [
    { tag: t.comment, color: "#6a9955" },
    { tag: t.variableName, color: "#9cdcfe" },
    { tag: [t.string, t.special(t.brace)], color: "#ce9178" },
    { tag: t.number, color: "#b5cea8" },
    { tag: t.bool, color: "#569cd6" },
    { tag: t.null, color: "#569cd6" },
    { tag: t.keyword, color: "#569cd6" },
    { tag: t.operator, color: "#d4d4d4" },
    { tag: t.className, color: "#4ec9b0" },
    { tag: t.definition(t.typeName), color: "#4ec9b0" },
    { tag: t.typeName, color: "#4ec9b0" },
    { tag: t.angleBracket, color: "#808080" },
    { tag: t.tagName, color: "#569cd6" },
    { tag: t.attributeName, color: "#9cdcfe" },
    { tag: t.function(t.variableName), color: "#dcdcaa" },
    { tag: t.definition(t.function(t.variableName)), color: "#dcdcaa" },
    { tag: t.paren, color: "#d4d4d4" },
    { tag: t.brace, color: "#d4d4d4" },
    { tag: t.squareBracket, color: "#d4d4d4" },
    { tag: t.punctuation, color: "#d4d4d4" },
    { tag: t.constant(t.variableName), color: "#4fc1ff" },
    { tag: t.moduleKeyword, color: "#c586c0" },
    { tag: t.regexp, color: "#d16969" },
  ],
});

export default CustomTheme;