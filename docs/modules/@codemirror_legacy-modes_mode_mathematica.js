async function moduleInitFunction(require,exports={}){function tokenBase(stream,state){var ch;// get next character
// string
return(ch=stream.next(),"\""===ch)?(state.tokenize=tokenString,state.tokenize(stream,state)):"("===ch&&stream.eat("*")?(state.commentLevel++,state.tokenize=tokenComment,state.tokenize(stream,state)):(stream.backUp(1),stream.match(reBaseForm,!0,!1))?"number":stream.match(reFloatForm,!0,!1)?"number":stream.match(/(?:In|Out)\[[0-9]*\]/,!0,!1)?"atom":stream.match(/([a-zA-Z\$][a-zA-Z0-9\$]*(?:`[a-zA-Z0-9\$]+)*::usage)/,!0,!1)?"meta":stream.match(/([a-zA-Z\$][a-zA-Z0-9\$]*(?:`[a-zA-Z0-9\$]+)*::[a-zA-Z\$][a-zA-Z0-9\$]*):?/,!0,!1)?"string.special":stream.match(/([a-zA-Z\$][a-zA-Z0-9\$]*\s*:)(?:(?:[a-zA-Z\$][a-zA-Z0-9\$]*)|(?:[^:=>~@\^\&\*\)\[\]'\?,\|])).*/,!0,!1)?"variableName.special":stream.match(/[a-zA-Z\$][a-zA-Z0-9\$]*_+[a-zA-Z\$][a-zA-Z0-9\$]*/,!0,!1)?"variableName.special":stream.match(/[a-zA-Z\$][a-zA-Z0-9\$]*_+/,!0,!1)?"variableName.special":stream.match(/_+[a-zA-Z\$][a-zA-Z0-9\$]*/,!0,!1)?"variableName.special":stream.match(/\\\[[a-zA-Z\$][a-zA-Z0-9\$]*\]/,!0,!1)?"character":stream.match(/(?:\[|\]|{|}|\(|\))/,!0,!1)?"bracket":stream.match(/(?:#[a-zA-Z\$][a-zA-Z0-9\$]*|#+[0-9]?)/,!0,!1)?"variableName.constant":stream.match(reIdInContext,!0,!1)?"keyword":stream.match(/(?:\\|\+|\-|\*|\/|,|;|\.|:|@|~|=|>|<|&|\||_|`|'|\^|\?|!|%)/,!0,!1)?"operator":(stream.next(),"error");// comment
// go back one character
// Mathematica numbers. Floats (1.2, .2, 1.) can have optionally a precision (`float) or an accuracy definition
// (``float). Note: while 1.2` is possible 1.2`` is not. At the end an exponent (float*^+12) can follow.
/* In[23] and Out[34] */ // usage
// message
// this makes a look-ahead match for something like variable:{_Integer}
// the match is then forwarded to the mma-patterns tokenizer.
// catch variables which are used together with Blank (_), BlankSequence (__) or BlankNullSequence (___)
// Cannot start with a number, but can have numbers at any other position. Examples
// blub__Integer, a1_, b34_Integer32
// Named characters in Mathematica, like \[Gamma].
// Match all braces separately
// Catch Slots (#, ##, #3, ##9 and the V10 named slots #name). I have never seen someone using more than one digit after #, so we match
// only one.
// Literals like variables, keywords, functions
// operators. Note that operators like @@ or /; are matched separately for each symbol.
// everything else is an error
}function tokenString(stream,state){for(var next,end=!1,escaped=!1;null!=(next=stream.next());){if("\""===next&&!escaped){end=!0;break}escaped=!escaped&&"\\"===next}return end&&!escaped&&(state.tokenize=tokenBase),"string"}function tokenComment(stream,state){for(var prev,next;0<state.commentLevel&&null!=(next=stream.next());)"("===prev&&"*"===next&&state.commentLevel++,"*"===prev&&")"===next&&state.commentLevel--,prev=next;return 0>=state.commentLevel&&(state.tokenize=tokenBase),"comment"}Object.defineProperty(exports,"__esModule",{value:!0});// used pattern building blocks
var pFloat="(?:\\.\\d+|\\d+\\.\\d*|\\d+)",pPrecision="(?:`(?:`?"+pFloat+")?)",reBaseForm=new RegExp("(?:"+"(?:\\d+)"+"(?:\\^\\^"+"(?:\\.\\w+|\\w+\\.\\w*|\\w+)"+pPrecision+"?(?:\\*\\^[+-]?\\d+)?))"),reFloatForm=new RegExp("(?:"+pFloat+pPrecision+"?(?:\\*\\^[+-]?\\d+)?)"),reIdInContext=/(?:`?)(?:[a-zA-Z\$][a-zA-Z0-9\$]*)(?:`(?:[a-zA-Z\$][a-zA-Z0-9\$]*))*(?:`?)/;return exports.mathematica={startState:function(){return{tokenize:tokenBase,commentLevel:0}},token:function(stream,state){return stream.eatSpace()?null:state.tokenize(stream,state)},languageData:{commentTokens:{block:{open:"(*",close:"*)"}}}},exports}