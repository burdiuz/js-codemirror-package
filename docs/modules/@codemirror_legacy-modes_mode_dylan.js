async function moduleInitFunction(require,exports={}){function forEach(arr,f){for(var i=0;i<arr.length;i++)f(arr[i],i)}function some(arr,f){for(var i=0;i<arr.length;i++)if(f(arr[i],i))return!0;return!1}// Words
function chain(stream,state,f){return state.tokenize=f,f(stream,state)}function tokenBase(stream,state){// String
var ch=stream.peek();if("'"==ch||"\""==ch)return stream.next(),chain(stream,state,tokenString(ch,"string"));// Comment
if("/"==ch){if(stream.next(),stream.eat("*"))return chain(stream,state,tokenComment);if(stream.eat("/"))return stream.skipToEnd(),"comment";stream.backUp(1)}// Decimal
else if(!/[+\-\d\.]/.test(ch)){if("#"==ch)return stream.next(),ch=stream.peek(),"\""==ch?(stream.next(),chain(stream,state,tokenString("\"","string"))):"b"==ch?(stream.next(),stream.eatWhile(/[01]/),"number"):"x"==ch?(stream.next(),stream.eatWhile(/[\da-f]/i),"number"):"o"==ch?(stream.next(),stream.eatWhile(/[0-7]/),"number"):"#"==ch?(stream.next(),"punctuation"):"["==ch||"("==ch?(stream.next(),"bracket"):stream.match(/f|t|all-keys|include|key|next|rest/i)?"atom":(stream.eatWhile(/[-a-zA-Z]/),"error");if("~"==ch)return stream.next(),ch=stream.peek(),"="==ch?(stream.next(),ch=stream.peek(),"="==ch?(stream.next(),"operator"):"operator"):"operator";if(":"==ch){if(stream.next(),ch=stream.peek(),"="==ch)return stream.next(),"operator";if(":"==ch)return stream.next(),"punctuation"}else{if(-1!="[](){}".indexOf(ch))return stream.next(),"bracket";if(-1!=".,".indexOf(ch))return stream.next(),"punctuation";if(stream.match("end"))return"keyword"}}else if(stream.match(/^[+-]?[0-9]*\.[0-9]*([esdx][+-]?[0-9]+)?/i)||stream.match(/^[+-]?[0-9]+([esdx][+-]?[0-9]+)/i)||stream.match(/^[+-]?\d+/))return"number";// Hash
for(var name in patterns)if(patterns.hasOwnProperty(name)){var pattern=patterns[name];if(pattern instanceof Array&&some(pattern,function(p){return stream.match(p)})||stream.match(pattern))return patternStyles[name]}return /[+\-*\/^=<>&|]/.test(ch)?(stream.next(),"operator"):stream.match("define")?"def":(stream.eatWhile(/[\w\-]/),wordLookup.hasOwnProperty(stream.current())?styleLookup[stream.current()]:stream.current().match(symbol)?"variable":(stream.next(),"variableName.standard"))}function tokenComment(stream,state){for(var ch,maybeEnd=!1,maybeNested=!1,nestedCount=0;ch=stream.next();){if(!("/"==ch&&maybeEnd))"*"==ch&&maybeNested&&nestedCount++;else if(0<nestedCount)nestedCount--;else{state.tokenize=tokenBase;break}maybeEnd="*"==ch,maybeNested="/"==ch}return"comment"}function tokenString(quote,style){return function(stream,state){for(var next,escaped=!1,end=!1;null!=(next=stream.next());){if(next==quote&&!escaped){end=!0;break}escaped=!escaped&&"\\"==next}return(end||!escaped)&&(state.tokenize=tokenBase),style}}// Interface
Object.defineProperty(exports,"__esModule",{value:!0});var words={// Words that introduce unnamed definitions like "define interface"
unnamedDefinition:["interface"],// Words that introduce simple named definitions like "define library"
namedDefinition:["module","library","macro","C-struct","C-union","C-function","C-callable-wrapper"],// Words that introduce type definitions like "define class".
// These are also parameterized like "define method" and are
// appended to otherParameterizedDefinitionWords
typeParameterizedDefinition:["class","C-subtype","C-mapped-subtype"],// Words that introduce trickier definitions like "define method".
// These require special definitions to be added to startExpressions
otherParameterizedDefinition:["method","function","C-variable","C-address"],// Words that introduce module constant definitions.
// These must also be simple definitions and are
// appended to otherSimpleDefinitionWords
constantSimpleDefinition:["constant"],// Words that introduce module variable definitions.
// These must also be simple definitions and are
// appended to otherSimpleDefinitionWords
variableSimpleDefinition:["variable"],// Other words that introduce simple definitions
// (without implicit bodies).
otherSimpleDefinition:["generic","domain","C-pointer-type","table"],// Words that begin statements with implicit bodies.
statement:["if","block","begin","method","case","for","select","when","unless","until","while","iterate","profiling","dynamic-bind"],// Patterns that act as separators in compound statements.
// This may include any general pattern that must be indented
// specially.
separator:["finally","exception","cleanup","else","elseif","afterwards"],// Keywords that do not require special indentation handling,
// but which should be highlighted
other:["above","below","by","from","handler","in","instance","let","local","otherwise","slot","subclass","then","to","keyed-by","virtual"],// Condition signaling function calls
signalingCalls:["signal","error","cerror","break","check-type","abort"]};words.otherDefinition=words.unnamedDefinition.concat(words.namedDefinition).concat(words.otherParameterizedDefinition),words.definition=words.typeParameterizedDefinition.concat(words.otherDefinition),words.parameterizedDefinition=words.typeParameterizedDefinition.concat(words.otherParameterizedDefinition),words.simpleDefinition=words.constantSimpleDefinition.concat(words.variableSimpleDefinition).concat(words.otherSimpleDefinition),words.keyword=words.statement.concat(words.separator).concat(words.other);// Patterns
var symbol=/^[-_a-zA-Z?!*@<>$%]+/,patterns={// Symbols with special syntax
symbolKeyword:"[-_a-zA-Z?!*@<>$%]+:",symbolClass:"<[-_a-zA-Z?!*@<>$%]+>",symbolGlobal:"\\*[-_a-zA-Z?!*@<>$%]+\\*",symbolConstant:"\\$[-_a-zA-Z?!*@<>$%]+"},patternStyles={symbolKeyword:"atom",symbolClass:"tag",symbolGlobal:"variableName.standard",symbolConstant:"variableName.constant"};// Compile all patterns to regular expressions
for(var patternName in patterns)patterns.hasOwnProperty(patternName)&&(patterns[patternName]=new RegExp("^"+patterns[patternName]));// Names beginning "with-" and "without-" are commonly
// used as statement macro
patterns.keyword=[/^with(?:out)?-[-_a-zA-Z?!*@<>$%]+/];var styles={keyword:"keyword",definition:"def",simpleDefinition:"def",signalingCalls:"builtin"},wordLookup={},styleLookup={};forEach(["keyword","definition","simpleDefinition","signalingCalls"],function(type){forEach(words[type],function(word){wordLookup[word]=type,styleLookup[word]=styles[type]})});return exports.dylan={startState:function(){return{tokenize:tokenBase,currentIndent:0}},token:function(stream,state){if(stream.eatSpace())return null;var style=state.tokenize(stream,state);return style},languageData:{commentTokens:{block:{open:"/*",close:"*/"}}}},exports}