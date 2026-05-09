async function moduleInitFunction(requireAsyncModule,exports={}){/**
Rust language support
*/var rust$1=await requireAsyncModule("@lezer/rust"),language=await requireAsyncModule("@codemirror/language");/**
A syntax provider based on the [Lezer Rust
parser](https://github.com/lezer-parser/rust), extended with
highlighting and indentation information.
*/const rustLanguage=language.LRLanguage.define({name:"rust",parser:rust$1.parser.configure({props:[language.indentNodeProp.add({IfExpression:language.continuedIndent({except:/^\s*({|else\b)/}),"String BlockComment":()=>null,AttributeItem:cx=>cx.continue(),"Statement MatchArm":language.continuedIndent()}),language.foldNodeProp.add(type=>/(Block|edTokens|List)$/.test(type.name)?language.foldInside:"BlockComment"==type.name?tree=>({from:tree.from+2,to:tree.to-2}):void 0)]}),languageData:{commentTokens:{line:"//",block:{open:"/*",close:"*/"}},indentOnInput:/^\s*(?:\{|\})$/,closeBrackets:{stringPrefixes:["b","r","br"]}}});return exports.rust=function(){return new language.LanguageSupport(rustLanguage)},exports.rustLanguage=rustLanguage,{exports:exports}.exports}