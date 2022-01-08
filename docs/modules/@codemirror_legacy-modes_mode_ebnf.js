async function moduleInitFunction(require,exports={}){Object.defineProperty(exports,"__esModule",{value:!0});var commentType={slash:0,parenthesis:1},stateType={comment:0,_string:1,characterClass:2};return exports.ebnf={startState:function(){return{stringType:null,commentType:null,braced:0,lhs:!0,localState:null,stack:[],inDefinition:!1}},token:function(stream,state){if(stream){//return state
//stack has
switch(0===state.stack.length&&("\""==stream.peek()||"'"==stream.peek()?(state.stringType=stream.peek(),stream.next(),state.stack.unshift(stateType._string)):stream.match("/*")?(state.stack.unshift(stateType.comment),state.commentType=commentType.slash):stream.match("(*")&&(state.stack.unshift(stateType.comment),state.commentType=commentType.parenthesis)),state.stack[0]){case stateType._string:for(;state.stack[0]===stateType._string&&!stream.eol();)stream.peek()===state.stringType?(// Skip quote
stream.next(),state.stack.shift()):"\\"===stream.peek()?(stream.next(),stream.next()):stream.match(/^.[^\\\"\']*/);return state.lhs?"property":"string";// Token style
case stateType.comment:for(;state.stack[0]===stateType.comment&&!stream.eol();)state.commentType===commentType.slash&&stream.match("*/")?(// Clear flag
state.stack.shift(),state.commentType=null):state.commentType===commentType.parenthesis&&stream.match("*)")?(// Clear flag
state.stack.shift(),state.commentType=null):stream.match(/^.[^\*]*/);return"comment";case stateType.characterClass:for(;state.stack[0]===stateType.characterClass&&!stream.eol();)stream.match(/^[^\]\\]+/)||stream.match(".")||state.stack.shift();return"operator";}var peek=stream.peek();//no stack
switch(peek){case"[":return stream.next(),state.stack.unshift(stateType.characterClass),"bracket";case":":case"|":case";":return stream.next(),"operator";case"%":if(stream.match("%%"))return"header";if(stream.match(/[%][A-Za-z]+/))return"keyword";if(stream.match(/[%][}]/))return"bracket";break;case"/":if(stream.match(/[\/][A-Za-z]+/))return"keyword";case"\\":if(stream.match(/[\][a-z]+/))return"string.special";case".":if(stream.match("."))return"atom";case"*":case"-":case"+":case"^":if(stream.match(peek))return"atom";case"$":if(stream.match("$$"))return"builtin";if(stream.match(/[$][0-9]+/))return"variableName.special";case"<":if(stream.match(/<<[a-zA-Z_]+>>/))return"builtin";}return stream.match("//")?(stream.skipToEnd(),"comment"):stream.match("return")?"operator":stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)?stream.match(/(?=[\(.])/)?"variable":stream.match(/(?=[\s\n]*[:=])/)?"def":"variableName.special":-1==["[","]","(",")"].indexOf(stream.peek())?(stream.eatSpace()||stream.next(),null):(stream.next(),"bracket")}//check for state changes
}},exports}