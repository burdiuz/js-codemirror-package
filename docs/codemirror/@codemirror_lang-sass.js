async function moduleInitFunction(requireAsyncModule,exports={}){/**
Language support for CSS.
*/Object.defineProperty(exports,"__esModule",{value:!0});var sass$1=await requireAsyncModule("@lezer/sass"),language=await requireAsyncModule("@codemirror/language"),langCss=await requireAsyncModule("@codemirror/lang-css");/**
A language provider based on the [Lezer Sass
parser](https://github.com/lezer-parser/sass), extended with
highlighting and indentation information.
*/const sassLanguage=language.LRLanguage.define({name:"sass",parser:sass$1.parser.configure({props:[language.foldNodeProp.add({Block:language.foldInside,Comment(node,state){return{from:node.from+2,to:"*/"==state.sliceDoc(node.to-2,node.to)?node.to-2:node.to}}}),language.indentNodeProp.add({Declaration:language.continuedIndent()})]}),languageData:{commentTokens:{block:{open:"/*",close:"*/"},line:"//"},indentOnInput:/^\s*\}$/,wordChars:"$-"}}),indentedSassLanguage=sassLanguage.configure({dialect:"indented",props:[language.indentNodeProp.add({"Block RuleSet":cx=>cx.baseIndent+cx.unit}),language.foldNodeProp.add({Block:node=>({from:node.from,to:node.to})})]}),sassCompletionSource=langCss.defineCSSCompletionSource(node=>"VariableName"==node.name||"SassVariableName"==node.name);/**
Property, variable, $-variable, and value keyword completion
source.
*/return exports.sass=function(config){return new language.LanguageSupport((null===config||void 0===config?void 0:config.indented)?indentedSassLanguage:sassLanguage,sassLanguage.data.of({autocomplete:sassCompletionSource}))},exports.sassCompletionSource=sassCompletionSource,exports.sassLanguage=sassLanguage,{exports:exports}.exports}