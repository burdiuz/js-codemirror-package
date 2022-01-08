async function moduleInitFunction(require,exports={}){Object.defineProperty(exports,"__esModule",{value:!0});var view=await require("@codemirror/view"),state=await require("@codemirror/state"),history=await require("@codemirror/history"),fold=await require("@codemirror/fold"),language=await require("@codemirror/language"),gutter=await require("@codemirror/gutter"),commands=await require("@codemirror/commands"),matchbrackets=await require("@codemirror/matchbrackets"),closebrackets=await require("@codemirror/closebrackets"),search=await require("@codemirror/search"),autocomplete=await require("@codemirror/autocomplete"),comment=await require("@codemirror/comment"),rectangularSelection=await require("@codemirror/rectangular-selection"),highlight=await require("@codemirror/highlight"),lint=await require("@codemirror/lint");/// This is an extension value that just pulls together a whole lot of
/// extensions that you might want in a basic editor. It is meant as a
/// convenient helper to quickly set up CodeMirror without installing
/// and importing a lot of packages.
///
/// Specifically, it includes...
///
///  - [the default command bindings](#commands.defaultKeymap)
///  - [line numbers](#gutter.lineNumbers)
///  - [special character highlighting](#view.highlightSpecialChars)
///  - [the undo history](#history.history)
///  - [a fold gutter](#fold.foldGutter)
///  - [custom selection drawing](#view.drawSelection)
///  - [drop cursor](#view.dropCursor)
///  - [multiple selections](#state.EditorState^allowMultipleSelections)
///  - [reindentation on input](#language.indentOnInput)
///  - [the default highlight style](#highlight.defaultHighlightStyle) (as fallback)
///  - [bracket matching](#matchbrackets.bracketMatching)
///  - [bracket closing](#closebrackets.closeBrackets)
///  - [autocompletion](#autocomplete.autocompletion)
///  - [rectangular selection](#rectangular-selection.rectangularSelection)
///  - [active line highlighting](#view.highlightActiveLine)
///  - [active line gutter highlighting](#gutter.highlightActiveLineGutter)
///  - [selection match highlighting](#search.highlightSelectionMatches)
///  - [search](#search.searchKeymap)
///  - [commenting](#comment.commentKeymap)
///  - [linting](#lint.lintKeymap)
///
/// (You'll probably want to add some language package to your setup
/// too.)
///
/// This package does not allow customization. The idea is that, once
/// you decide you want to configure your editor more precisely, you
/// take this package's source (which is just a bunch of imports and
/// an array literal), copy it into your own code, and adjust it as
/// desired.
const basicSetup=[gutter.lineNumbers(),gutter.highlightActiveLineGutter(),view.highlightSpecialChars(),history.history(),fold.foldGutter(),view.drawSelection(),view.dropCursor(),state.EditorState.allowMultipleSelections.of(!0),language.indentOnInput(),highlight.defaultHighlightStyle.fallback,matchbrackets.bracketMatching(),closebrackets.closeBrackets(),autocomplete.autocompletion(),rectangularSelection.rectangularSelection(),view.highlightActiveLine(),search.highlightSelectionMatches(),view.keymap.of([...closebrackets.closeBracketsKeymap,...commands.defaultKeymap,...search.searchKeymap,...history.historyKeymap,...fold.foldKeymap,...comment.commentKeymap,...autocomplete.completionKeymap,...lint.lintKeymap])];return Object.defineProperty(exports,"EditorView",{enumerable:!0,get:function(){return view.EditorView}}),Object.defineProperty(exports,"EditorState",{enumerable:!0,get:function(){return state.EditorState}}),exports.basicSetup=basicSetup,exports}