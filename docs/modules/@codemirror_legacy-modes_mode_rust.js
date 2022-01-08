async function moduleInitFunction(require,exports={}){function ensureState(states,name){if(!states.hasOwnProperty(name))throw new Error("Undefined state "+name+" in simple mode")}function toRegex(val,caret){if(!val)return /(?:)/;var flags="";return val instanceof RegExp?(val.ignoreCase&&(flags="i"),val=val.source):val+="",new RegExp((!1===caret?"":"^")+"(?:"+val+")",flags)}function asToken(val){if(!val)return null;if(val.apply)return val;if("string"==typeof val)return val.replace(/\./g," ");for(var result=[],i=0;i<val.length;i++)result.push(val[i]&&val[i].replace(/\./g," "));return result}function Rule(data,states){(data.next||data.push)&&ensureState(states,data.next||data.push),this.regex=toRegex(data.regex),this.token=asToken(data.token),this.data=data}function tokenFunction(states){return function(stream,state){if(state.pending){var pend=state.pending.shift();return 0==state.pending.length&&(state.pending=null),stream.pos+=pend.text.length,pend.token}for(var curState=states[state.state],i=0;i<curState.length;i++){var rule=curState[i],matches=(!rule.data.sol||stream.sol())&&stream.match(rule.regex);if(matches){rule.data.next?state.state=rule.data.next:rule.data.push?((state.stack||(state.stack=[])).push(state.state),state.state=rule.data.push):rule.data.pop&&state.stack&&state.stack.length&&(state.state=state.stack.pop()),rule.data.indent&&state.indent.push(stream.indentation()+stream.indentUnit),rule.data.dedent&&state.indent.pop();var token=rule.token;if(token&&token.apply&&(token=token(matches)),2<matches.length&&rule.token&&"string"!=typeof rule.token){state.pending=[];for(var j=2;j<matches.length;j++)matches[j]&&state.pending.push({text:matches[j],token:rule.token[j-1]});return stream.backUp(matches[0].length-(matches[1]?matches[1].length:0)),token[0]}return token&&token.join?token[0]:token}}return stream.next(),null}}function indentFunction(states,meta){return function(state,textAfter){if(null==state.indent||meta.dontIndentStates&&-1<meta.doneIndentState.indexOf(state.state))return null;var pos=state.indent.length-1,rules=states[state.state];scan:for(;;){for(var rule,i=0;i<rules.length;i++)if(rule=rules[i],rule.data.dedent&&!1!==rule.data.dedentIfLineStart){var m=rule.regex.exec(textAfter);if(m&&m[0]){pos--,(rule.next||rule.push)&&(rules=states[rule.next||rule.push]),textAfter=textAfter.slice(m[0].length);continue scan}}break}return 0>pos?0:state.indent[pos]}}Object.defineProperty(exports,"__esModule",{value:!0});const rust=function(states){ensureState(states,"start");var states_={},meta=states.languageData||{},hasIndentation=!1;for(var state in states)if(state!=meta&&states.hasOwnProperty(state))for(var data,list=states_[state]=[],orig=states[state],i=0;i<orig.length;i++)data=orig[i],list.push(new Rule(data,states)),(data.indent||data.dedent)&&(hasIndentation=!0);return{startState:function(){return{state:"start",pending:null,indent:hasIndentation?[]:null}},copyState:function(state){var s={state:state.state,pending:state.pending,indent:state.indent&&state.indent.slice(0)};return state.stack&&(s.stack=state.stack.slice(0)),s},token:tokenFunction(states_),indent:indentFunction(states_,meta),languageData:meta}}({start:[// string and byte string
{regex:/b?"/,token:"string",next:"string"},// raw string and raw byte string
{regex:/b?r"/,token:"string",next:"string_raw"},{regex:/b?r#+"/,token:"string",next:"string_raw_hash"},// character
{regex:/'(?:[^'\\]|\\(?:[nrt0'"]|x[\da-fA-F]{2}|u\{[\da-fA-F]{6}\}))'/,token:"string.special"},// byte
{regex:/b'(?:[^']|\\(?:['\\nrt0]|x[\da-fA-F]{2}))'/,token:"string.special"},{regex:/(?:(?:[0-9][0-9_]*)(?:(?:[Ee][+-]?[0-9_]+)|\.[0-9_]+(?:[Ee][+-]?[0-9_]+)?)(?:f32|f64)?)|(?:0(?:b[01_]+|(?:o[0-7_]+)|(?:x[0-9a-fA-F_]+))|(?:[0-9][0-9_]*))(?:u8|u16|u32|u64|i8|i16|i32|i64|isize|usize)?/,token:"number"},{regex:/(let(?:\s+mut)?|fn|enum|mod|struct|type|union)(\s+)([a-zA-Z_][a-zA-Z0-9_]*)/,token:["keyword",null,"def"]},{regex:/(?:abstract|alignof|as|async|await|box|break|continue|const|crate|do|dyn|else|enum|extern|fn|for|final|if|impl|in|loop|macro|match|mod|move|offsetof|override|priv|proc|pub|pure|ref|return|self|sizeof|static|struct|super|trait|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,token:"keyword"},{regex:/\b(?:Self|isize|usize|char|bool|u8|u16|u32|u64|f16|f32|f64|i8|i16|i32|i64|str|Option)\b/,token:"atom"},{regex:/\b(?:true|false|Some|None|Ok|Err)\b/,token:"builtin"},{regex:/\b(fn)(\s+)([a-zA-Z_][a-zA-Z0-9_]*)/,token:["keyword",null,"def"]},{regex:/#!?\[.*\]/,token:"meta"},{regex:/\/\/.*/,token:"comment"},{regex:/\/\*/,token:"comment",next:"comment"},{regex:/[-+\/*=<>!]+/,token:"operator"},{regex:/[a-zA-Z_]\w*!/,token:"macroName"},{regex:/[a-zA-Z_]\w*/,token:"variable"},{regex:/[\{\[\(]/,indent:!0},{regex:/[\}\]\)]/,dedent:!0}],string:[{regex:/"/,token:"string",next:"start"},{regex:/(?:[^\\"]|\\(?:.|$))*/,token:"string"}],string_raw:[{regex:/"/,token:"string",next:"start"},{regex:/[^"]*/,token:"string"}],string_raw_hash:[{regex:/"#+/,token:"string",next:"start"},{regex:/(?:[^"]|"(?!#))*/,token:"string"}],comment:[{regex:/.*?\*\//,token:"comment",next:"start"},{regex:/.*/,token:"comment"}],languageData:{dontIndentStates:["comment"],indentOnInput:/^\s*\}$/,commentTokens:{line:"//",block:{open:"/*",close:"*/"}}}});return exports.rust=rust,exports}