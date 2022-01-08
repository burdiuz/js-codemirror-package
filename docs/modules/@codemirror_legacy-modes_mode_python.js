async function moduleInitFunction(require,exports={}){function wordRegexp(words){return new RegExp("^(("+words.join(")|(")+"))\\b")}function top(state){return state.scopes[state.scopes.length-1]}function mkPython(parserConf){// tokenizers
function tokenBase(stream,state){var sol=stream.sol()&&"\\"!=state.lastToken;// Handle scope changes
if(sol&&(state.indent=stream.indentation()),sol&&"py"==top(state).type){var scopeOffset=top(state).offset;if(stream.eatSpace()){var lineOffset=stream.indentation();return lineOffset>scopeOffset?pushPyScope(stream,state):lineOffset<scopeOffset&&dedent(stream,state)&&"#"!=stream.peek()&&(state.errorToken=!0),null}var style=tokenBaseInner(stream,state);return 0<scopeOffset&&dedent(stream,state)&&(style+=" error"),style}return tokenBaseInner(stream,state)}function tokenBaseInner(stream,state,inFormat){if(stream.eatSpace())return null;// Handle Comments
if(!inFormat&&stream.match(/^#.*/))return"comment";// Handle Number Literals
if(stream.match(/^[0-9\.]/,!1)){var floatLiteral=!1;// Floats
if(stream.match(/^[\d_]*\.\d+(e[\+\-]?\d+)?/i)&&(floatLiteral=!0),stream.match(/^[\d_]+\.\d*/)&&(floatLiteral=!0),stream.match(/^\.\d+/)&&(floatLiteral=!0),floatLiteral)return stream.eat(/J/i),"number";// Integers
var intLiteral=!1;// Hex
if(stream.match(/^0x[0-9a-f_]+/i)&&(intLiteral=!0),stream.match(/^0b[01_]+/i)&&(intLiteral=!0),stream.match(/^0o[0-7_]+/i)&&(intLiteral=!0),stream.match(/^[1-9][\d_]*(e[\+\-]?[\d_]+)?/)&&(stream.eat(/J/i),intLiteral=!0),stream.match(/^0(?![\dx])/i)&&(intLiteral=!0),intLiteral)return stream.eat(/L/i),"number"}// Handle Strings
if(stream.match(stringPrefixes)){var isFmtString=-1!==stream.current().toLowerCase().indexOf("f");return isFmtString?(state.tokenize=formatStringFactory(stream.current(),state.tokenize),state.tokenize(stream,state)):(state.tokenize=tokenStringFactory(stream.current(),state.tokenize),state.tokenize(stream,state))}for(var i=0;i<operators.length;i++)if(stream.match(operators[i]))return"operator";return stream.match(delimiters)?"punctuation":"."==state.lastToken&&stream.match(identifiers)?"property":stream.match(keywords)||stream.match(wordOperators)?"keyword":stream.match(builtins)?"builtin":stream.match(/^(self|cls)\b/)?"self":stream.match(identifiers)?"def"==state.lastToken||"class"==state.lastToken?"def":"variable":(stream.next(),inFormat?null:"error");// Handle non-detected items
}function formatStringFactory(delimiter,tokenOuter){function tokenNestedExpr(depth){return function(stream,state){var inner=tokenBaseInner(stream,state,!0);return"punctuation"==inner&&("{"==stream.current()?state.tokenize=tokenNestedExpr(depth+1):"}"==stream.current()&&(1<depth?state.tokenize=tokenNestedExpr(depth-1):state.tokenize=tokenString)),inner}}function tokenString(stream,state){for(;!stream.eol();)if(stream.eatWhile(/[^'"\{\}\\]/),!stream.eat("\\")){if(stream.match(delimiter))return state.tokenize=tokenOuter,"string";if(stream.match("{{"))// ignore {{ in f-str
return"string";if(stream.match("{",!1))return state.tokenize=tokenNestedExpr(0),stream.current()?"string":state.tokenize(stream,state);if(stream.match("}}"))return"string";if(stream.match("}"))// single } in f-string is an error
return"error";stream.eat(/['"]/)}else if(stream.next(),singleline&&stream.eol())return"string";if(singleline){if(parserConf.singleLineStringErrors)return"error";state.tokenize=tokenOuter}return"string"}for(;0<="rubf".indexOf(delimiter.charAt(0).toLowerCase());)delimiter=delimiter.substr(1);var singleline=1==delimiter.length;return tokenString.isString=!0,tokenString}function tokenStringFactory(delimiter,tokenOuter){function tokenString(stream,state){for(;!stream.eol();)if(stream.eatWhile(/[^'"\\]/),!stream.eat("\\")){if(stream.match(delimiter))return state.tokenize=tokenOuter,"string";stream.eat(/['"]/)}else if(stream.next(),singleline&&stream.eol())return"string";if(singleline){if(parserConf.singleLineStringErrors)return"error";state.tokenize=tokenOuter}return"string"}for(;0<="rubf".indexOf(delimiter.charAt(0).toLowerCase());)delimiter=delimiter.substr(1);var singleline=1==delimiter.length;return tokenString.isString=!0,tokenString}function pushPyScope(stream,state){for(;"py"!=top(state).type;)state.scopes.pop();state.scopes.push({offset:top(state).offset+stream.indentUnit,type:"py",align:null})}function pushBracketScope(stream,state,type){var align=stream.match(/^[\s\[\{\(]*(?:#|$)/,!1)?null:stream.column()+1;state.scopes.push({offset:state.indent+(hangingIndent||stream.indentUnit),type:type,align:align})}function dedent(stream,state){for(var indented=stream.indentation();1<state.scopes.length&&top(state).offset>indented;){if("py"!=top(state).type)return!0;state.scopes.pop()}return top(state).offset!=indented}function tokenLexer(stream,state){stream.sol()&&(state.beginningOfLine=!0,state.dedent=!1);var style=state.tokenize(stream,state),current=stream.current();// Handle decorators
if(state.beginningOfLine&&"@"==current)return stream.match(identifiers,!1)?"meta":py3?"operator":"error";if(/\S/.test(current)&&(state.beginningOfLine=!1),("variable"==style||"builtin"==style)&&"meta"==state.lastToken&&(style="meta"),("pass"==current||"return"==current)&&(state.dedent=!0),"lambda"==current&&(state.lambda=!0),":"==current&&!state.lambda&&"py"==top(state).type&&stream.match(/^\s*(?:#|$)/,!1)&&pushPyScope(stream,state),1==current.length&&!/string|comment/.test(style)){var delimiter_index="[({".indexOf(current);if(-1!=delimiter_index&&pushBracketScope(stream,state,"])}".slice(delimiter_index,delimiter_index+1)),delimiter_index="])}".indexOf(current),-1!=delimiter_index)if(top(state).type==current)state.indent=state.scopes.pop().offset-(hangingIndent||stream.indentUnit);else return"error"}return state.dedent&&stream.eol()&&"py"==top(state).type&&1<state.scopes.length&&state.scopes.pop(),style}for(var ERRORCLASS="error",delimiters=parserConf.delimiters||parserConf.singleDelimiters||/^[\(\)\[\]\{\}@,:`=;\.\\]/,operators=[parserConf.singleOperators,parserConf.doubleOperators,parserConf.doubleDelimiters,parserConf.tripleDelimiters,parserConf.operators||/^([-+*/%\/&|^]=?|[<>=]+|\/\/=?|\*\*=?|!=|[~!@]|\.\.\.)/],i=0;i<operators.length;i++)operators[i]||operators.splice(i--,1);var hangingIndent=parserConf.hangingIndent,myKeywords=commonKeywords,myBuiltins=commonBuiltins;null!=parserConf.extra_keywords&&(myKeywords=myKeywords.concat(parserConf.extra_keywords)),null!=parserConf.extra_builtins&&(myBuiltins=myBuiltins.concat(parserConf.extra_builtins));var py3=!(parserConf.version&&3>+parserConf.version);if(py3){// since http://legacy.python.org/dev/peps/pep-0465/ @ is also an operator
var identifiers=parserConf.identifiers||/^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*/;myKeywords=myKeywords.concat(["nonlocal","False","True","None","async","await"]),myBuiltins=myBuiltins.concat(["ascii","bytes","exec","print"]);var stringPrefixes=/^(([rbuf]|(br)|(rb)|(fr)|(rf))?('{3}|"{3}|['"]))/i}else{var identifiers=parserConf.identifiers||/^[_A-Za-z][_A-Za-z0-9]*/;myKeywords=myKeywords.concat(["exec","print"]),myBuiltins=myBuiltins.concat(["apply","basestring","buffer","cmp","coerce","execfile","file","intern","long","raw_input","reduce","reload","unichr","unicode","xrange","False","True","None"]);var stringPrefixes=/^(([rubf]|(ur)|(br))?('{3}|"{3}|['"]))/i}var keywords=wordRegexp(myKeywords),builtins=wordRegexp(myBuiltins);return{startState:function(){return{tokenize:tokenBase,scopes:[{offset:0,type:"py",align:null}],indent:0,lastToken:null,lambda:!1,dedent:0}},token:function(stream,state){var addErr=state.errorToken;addErr&&(state.errorToken=!1);var style=tokenLexer(stream,state);return style&&"comment"!=style&&(state.lastToken="keyword"==style||"punctuation"==style?stream.current():style),"punctuation"==style&&(style=null),stream.eol()&&state.lambda&&(state.lambda=!1),addErr?ERRORCLASS:style},indent:function(state,textAfter,cx){if(state.tokenize!=tokenBase)return state.tokenize.isString?null:0;var scope=top(state),closing=scope.type==textAfter.charAt(0)||"py"==scope.type&&!state.dedent&&/^(else:|elif |except |finally:)/.test(textAfter);return null==scope.align?scope.offset-(closing?hangingIndent||cx.unit:0):scope.align-(closing?1:0)},languageData:{autocomplete:commonKeywords.concat(commonBuiltins),indentOnInput:/^\s*([\}\]\)]|else:|elif |except |finally:)$/,commentTokens:{line:"#"},closeBrackets:{brackets:["(","[","{","'","\"","'''","\"\"\""]}}}}Object.defineProperty(exports,"__esModule",{value:!0});var wordOperators=wordRegexp(["and","or","not","is"]),commonKeywords=["as","assert","break","class","continue","def","del","elif","else","except","finally","for","from","global","if","import","lambda","pass","raise","return","try","while","with","yield","in"],commonBuiltins=["abs","all","any","bin","bool","bytearray","callable","chr","classmethod","compile","complex","delattr","dict","dir","divmod","enumerate","eval","filter","float","format","frozenset","getattr","globals","hasattr","hash","help","hex","id","input","int","isinstance","issubclass","iter","len","list","locals","map","max","memoryview","min","next","object","oct","open","ord","pow","property","range","repr","reversed","round","set","setattr","slice","sorted","staticmethod","str","sum","super","tuple","type","vars","zip","__import__","NotImplemented","Ellipsis","__debug__"];const python=mkPython({}),cython=mkPython({extra_keywords:function(str){return str.split(" ")}("by cdef cimport cpdef ctypedef enum except extern gil include nogil property public readonly struct union DEF IF ELIF ELSE")});return exports.cython=cython,exports.mkPython=mkPython,exports.python=python,exports}