import React from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { useEffect, useRef } from "react";
import { myLanguageLinting } from "../utils/lintExtensions";
import { lineNumbers } from "@codemirror/view";
import { customAutocomplete } from "../utils/AutoCompletion";
import { CustomLanguage } from "../grammar/CustomLanguage";
import CustomThem from "../style/them";

const CodeEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // استرجاع المحتوى المحفوظ من LocalStorage
    const savedContent = localStorage.getItem("codeContent") || "";

    const state = EditorState.create({
      doc: savedContent, // تعيين المحتوى المحفوظ كمحتوى ابتدائي
      extensions: [
        basicSetup,
        CustomLanguage,
        customAutocomplete,
        myLanguageLinting,
        CustomThem,
        lineNumbers(),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
          },
          ".cm-gutters": {
            backgroundColor: "#1e1e1e",
            color: "#858585",
            borderRight: "1px solid #333",
          },
          ".cm-activeLine": {
            backgroundColor: "#2d2d2d",
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            // حفظ المحتوى في LocalStorage عند تغيير النص
            const content = update.state.doc.toString();
            localStorage.setItem("codeContent", content);
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => view.destroy();
  }, []);

  return <div ref={editorRef} style={{ height: "100%", width: "100%" }} />;
};

export default CodeEditor;
