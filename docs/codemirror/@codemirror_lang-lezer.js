async function moduleInitFunction(requireAsyncModule,exports={}){/**
Language support for Lezer grammars.
*/var lezer$1=await requireAsyncModule("@lezer/lezer"),language=await requireAsyncModule("@codemirror/language");/**
A language provider based on the [Lezer Lezer
parser](https://github.com/lezer-parser/lezer-grammar), extended
with highlighting and indentation information.
*/const lezerLanguage=language.LRLanguage.define({name:"lezer",parser:lezer$1.parser.configure({props:[language.foldNodeProp.add({"Body TokensBody SkipBody PrecedenceBody":language.foldInside})]}),languageData:{commentTokens:{block:{open:"/*",close:"*/"},line:"//"},indentOnInput:/^\s*\}$/}});return exports.lezer=function(){return new language.LanguageSupport(lezerLanguage)},exports.lezerLanguage=lezerLanguage,{exports:exports}.exports}