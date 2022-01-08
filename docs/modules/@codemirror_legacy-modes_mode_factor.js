async function moduleInitFunction(require,exports={}){function ensureState(states,name){if(!states.hasOwnProperty(name))throw new Error("Undefined state "+name+" in simple mode")}function toRegex(val,caret){if(!val)return /(?:)/;var flags="";return val instanceof RegExp?(val.ignoreCase&&(flags="i"),val=val.source):val+="",new RegExp((!1===caret?"":"^")+"(?:"+val+")",flags)}function asToken(val){if(!val)return null;if(val.apply)return val;if("string"==typeof val)return val.replace(/\./g," ");for(var result=[],i=0;i<val.length;i++)result.push(val[i]&&val[i].replace(/\./g," "));return result}function Rule(data,states){(data.next||data.push)&&ensureState(states,data.next||data.push),this.regex=toRegex(data.regex),this.token=asToken(data.token),this.data=data}function tokenFunction(states){return function(stream,state){if(state.pending){var pend=state.pending.shift();return 0==state.pending.length&&(state.pending=null),stream.pos+=pend.text.length,pend.token}for(var curState=states[state.state],i=0;i<curState.length;i++){var rule=curState[i],matches=(!rule.data.sol||stream.sol())&&stream.match(rule.regex);if(matches){rule.data.next?state.state=rule.data.next:rule.data.push?((state.stack||(state.stack=[])).push(state.state),state.state=rule.data.push):rule.data.pop&&state.stack&&state.stack.length&&(state.state=state.stack.pop()),rule.data.indent&&state.indent.push(stream.indentation()+stream.indentUnit),rule.data.dedent&&state.indent.pop();var token=rule.token;if(token&&token.apply&&(token=token(matches)),2<matches.length&&rule.token&&"string"!=typeof rule.token){state.pending=[];for(var j=2;j<matches.length;j++)matches[j]&&state.pending.push({text:matches[j],token:rule.token[j-1]});return stream.backUp(matches[0].length-(matches[1]?matches[1].length:0)),token[0]}return token&&token.join?token[0]:token}}return stream.next(),null}}function indentFunction(states,meta){return function(state,textAfter){if(null==state.indent||meta.dontIndentStates&&-1<meta.doneIndentState.indexOf(state.state))return null;var pos=state.indent.length-1,rules=states[state.state];scan:for(;;){for(var rule,i=0;i<rules.length;i++)if(rule=rules[i],rule.data.dedent&&!1!==rule.data.dedentIfLineStart){var m=rule.regex.exec(textAfter);if(m&&m[0]){pos--,(rule.next||rule.push)&&(rules=states[rule.next||rule.push]),textAfter=textAfter.slice(m[0].length);continue scan}}break}return 0>pos?0:state.indent[pos]}}Object.defineProperty(exports,"__esModule",{value:!0});const factor=function(states){ensureState(states,"start");var states_={},meta=states.languageData||{},hasIndentation=!1;for(var state in states)if(state!=meta&&states.hasOwnProperty(state))for(var data,list=states_[state]=[],orig=states[state],i=0;i<orig.length;i++)data=orig[i],list.push(new Rule(data,states)),(data.indent||data.dedent)&&(hasIndentation=!0);return{startState:function(){return{state:"start",pending:null,indent:hasIndentation?[]:null}},copyState:function(state){var s={state:state.state,pending:state.pending,indent:state.indent&&state.indent.slice(0)};return state.stack&&(s.stack=state.stack.slice(0)),s},token:tokenFunction(states_),indent:indentFunction(states_,meta),languageData:meta}}({start:[// comments
{regex:/#?!.*/,token:"comment"},// strings """, multiline --> state
{regex:/"""/,token:"string",next:"string3"},{regex:/(STRING:)(\s)/,token:["keyword",null],next:"string2"},{regex:/\S*?"/,token:"string",next:"string"},// numbers: dec, hex, unicode, bin, fractional, complex
{regex:/(?:0x[\d,a-f]+)|(?:0o[0-7]+)|(?:0b[0,1]+)|(?:\-?\d+.?\d*)(?=\s)/,token:"number"},//{regex: /[+-]?/} //fractional
// definition: defining word, defined word, etc
{regex:/((?:GENERIC)|\:?\:)(\s+)(\S+)(\s+)(\()/,token:["keyword",null,"def",null,"bracket"],next:"stack"},// method definition: defining word, type, defined word, etc
{regex:/(M\:)(\s+)(\S+)(\s+)(\S+)/,token:["keyword",null,"def",null,"tag"]},// vocabulary using --> state
{regex:/USING\:/,token:"keyword",next:"vocabulary"},// vocabulary definition/use
{regex:/(USE\:|IN\:)(\s+)(\S+)(?=\s|$)/,token:["keyword",null,"tag"]},// definition: a defining word, defined word
{regex:/(\S+\:)(\s+)(\S+)(?=\s|$)/,token:["keyword",null,"def"]},// "keywords", incl. ; t f . [ ] { } defining words
{regex:/(?:;|\\|t|f|if|loop|while|until|do|PRIVATE>|<PRIVATE|\.|\S*\[|\]|\S*\{|\})(?=\s|$)/,token:"keyword"},// <constructors> and the like
{regex:/\S+[\)>\.\*\?]+(?=\s|$)/,token:"builtin"},{regex:/[\)><]+\S+(?=\s|$)/,token:"builtin"},// operators
{regex:/(?:[\+\-\=\/\*<>])(?=\s|$)/,token:"keyword"},// any id (?)
{regex:/\S+/,token:"variable"},{regex:/\s+|./,token:null}],vocabulary:[{regex:/;/,token:"keyword",next:"start"},{regex:/\S+/,token:"tag"},{regex:/\s+|./,token:null}],string:[{regex:/(?:[^\\]|\\.)*?"/,token:"string",next:"start"},{regex:/.*/,token:"string"}],string2:[{regex:/^;/,token:"keyword",next:"start"},{regex:/.*/,token:"string"}],string3:[{regex:/(?:[^\\]|\\.)*?"""/,token:"string",next:"start"},{regex:/.*/,token:"string"}],stack:[{regex:/\)/,token:"bracket",next:"start"},{regex:/--/,token:"bracket"},{regex:/\S+/,token:"meta"},{regex:/\s+|./,token:null}],languageData:{dontIndentStates:["start","vocabulary","string","string3","stack"],commentTokens:{line:"!"}}});return exports.factor=factor,exports}