async function moduleInitFunction(requireAsyncModule,exports={}){function getErrorPosition(error,doc){let m;return(m=error.message.match(/at position (\d+)/))?Math.min(+m[1],doc.length):(m=error.message.match(/at line (\d+) column (\d+)/))?Math.min(doc.line(+m[1]).from+ +m[2]-1,doc.length):0}/**
A language provider that provides JSON parsing.
*/ /**
JSON language support.
*/var json$1=await requireAsyncModule("@lezer/json"),language=await requireAsyncModule("@codemirror/language");/**
Calls
[`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
on the document and, if that throws an error, reports it as a
single diagnostic.
*/const jsonLanguage=language.LRLanguage.define({name:"json",parser:json$1.parser.configure({props:[language.indentNodeProp.add({Object:language.continuedIndent({except:/^\s*\}/}),Array:language.continuedIndent({except:/^\s*\]/})}),language.foldNodeProp.add({"Object Array":language.foldInside})]}),languageData:{closeBrackets:{brackets:["[","{","\""]},indentOnInput:/^\s*[\}\]]$/}});return exports.json=function(){return new language.LanguageSupport(jsonLanguage)},exports.jsonLanguage=jsonLanguage,exports.jsonParseLinter=()=>view=>{try{JSON.parse(view.state.doc.toString())}catch(e){if(!(e instanceof SyntaxError))throw e;const pos=getErrorPosition(e,view.state.doc);return[{from:pos,message:e.message,severity:"error",to:pos}]}return[]},{exports:exports}.exports}