async function moduleInitFunction(require,exports={}){function wordRegexp(words){return new RegExp("^(("+words.join(")|(")+"))\\b","i")}function indent(_stream,state){state.currentIndent++}function dedent(_stream,state){state.currentIndent--}// tokenizers
function tokenBase(stream,state){if(stream.eatSpace())return null;var ch=stream.peek();// Handle Comments
if("'"===ch)return stream.skipToEnd(),"comment";// Handle Number Literals
if(stream.match(/^((&H)|(&O))?[0-9\.a-f]/i,!1)){var floatLiteral=!1;// Floats
if(stream.match(/^\d*\.\d+F?/i)?floatLiteral=!0:stream.match(/^\d+\.\d*F?/)?floatLiteral=!0:stream.match(/^\.\d+F?/)&&(floatLiteral=!0),floatLiteral)return stream.eat(/J/i),"number";// Integers
var intLiteral=!1;// Hex
if(stream.match(/^&H[0-9a-f]+/i)?intLiteral=!0:stream.match(/^&O[0-7]+/i)?intLiteral=!0:stream.match(/^[1-9]\d*F?/)?(stream.eat(/J/i),intLiteral=!0):stream.match(/^0(?![\dx])/i)&&(intLiteral=!0),intLiteral)return stream.eat(/L/i),"number"}// Handle Strings
return stream.match("\"")?(state.tokenize=tokenStringFactory(stream.current()),state.tokenize(stream,state)):stream.match(tripleDelimiters)||stream.match(doubleDelimiters)?null:stream.match(doubleOperators)||stream.match(singleOperators)||stream.match(wordOperators)?"operator":stream.match(singleDelimiters)?null:stream.match(doOpening)?(indent(stream,state),state.doInCurrentLine=!0,"keyword"):stream.match(opening)?(state.doInCurrentLine?state.doInCurrentLine=!1:indent(stream,state),"keyword"):stream.match(middle)?"keyword":stream.match(doubleClosing)?(dedent(stream,state),dedent(stream,state),"keyword"):stream.match(closing)?(dedent(stream,state),"keyword"):stream.match(types)?"keyword":stream.match(keywords)?"keyword":stream.match(identifiers)?"variable":(stream.next(),"error");// Handle operators and Delimiters
// Handle non-detected items
}function tokenStringFactory(delimiter){var singleline=1==delimiter.length,OUTCLASS="string";return function(stream,state){for(;!stream.eol();){if(stream.eatWhile(/[^'"]/),stream.match(delimiter))return state.tokenize=tokenBase,OUTCLASS;stream.eat(/['"]/)}return singleline&&(state.tokenize=tokenBase),OUTCLASS}}function tokenLexer(stream,state){var style=state.tokenize(stream,state),current=stream.current();// Handle '.' connected identifiers
if("."===current)return style=state.tokenize(stream,state),"variable"===style?"variable":"error";var delimiter_index="[({".indexOf(current);return-1!==delimiter_index&&indent(stream,state),delimiter_index="])}".indexOf(current),-1!==delimiter_index&&dedent(stream,state)?"error":style}Object.defineProperty(exports,"__esModule",{value:!0});var singleOperators=/^[\+\-\*/%&\\|\^~<>!]/,singleDelimiters=/^[\(\)\[\]\{\}@,:`=;\.]/,doubleOperators=/^((==)|(<>)|(<=)|(>=)|(<>)|(<<)|(>>)|(\/\/)|(\*\*))/,doubleDelimiters=/^((\+=)|(\-=)|(\*=)|(%=)|(\/=)|(&=)|(\|=)|(\^=))/,tripleDelimiters=/^((\/\/=)|(>>=)|(<<=)|(\*\*=))/,identifiers=/^[_A-Za-z][_A-Za-z0-9]*/,openingKeywords=["class","module","sub","enum","select","while","if","function","get","set","property","try","structure","synclock","using","with"],middleKeywords=["else","elseif","case","catch","finally"],endKeywords=["next","loop"],operatorKeywords=["and","andalso","or","orelse","xor","in","not","is","isnot","like"],wordOperators=wordRegexp(operatorKeywords),commonKeywords=["#const","#else","#elseif","#end","#if","#region","addhandler","addressof","alias","as","byref","byval","cbool","cbyte","cchar","cdate","cdbl","cdec","cint","clng","cobj","compare","const","continue","csbyte","cshort","csng","cstr","cuint","culng","cushort","declare","default","delegate","dim","directcast","each","erase","error","event","exit","explicit","false","for","friend","gettype","goto","handles","implements","imports","infer","inherits","interface","isfalse","istrue","lib","me","mod","mustinherit","mustoverride","my","mybase","myclass","namespace","narrowing","new","nothing","notinheritable","notoverridable","of","off","on","operator","option","optional","out","overloads","overridable","overrides","paramarray","partial","private","protected","public","raiseevent","readonly","redim","removehandler","resume","return","shadows","shared","static","step","stop","strict","then","throw","to","true","trycast","typeof","until","until","when","widening","withevents","writeonly"],commontypes=["object","boolean","char","string","byte","sbyte","short","ushort","int16","uint16","integer","uinteger","int32","uint32","long","ulong","int64","uint64","decimal","single","double","float","date","datetime","intptr","uintptr"],keywords=wordRegexp(commonKeywords),types=wordRegexp(commontypes),opening=wordRegexp(openingKeywords),middle=wordRegexp(middleKeywords),closing=wordRegexp(endKeywords),doubleClosing=wordRegexp(["end"]),doOpening=wordRegexp(["do"]);const vb={startState:function(){return{tokenize:tokenBase,lastToken:null,currentIndent:0,nextLineIndent:0,doInCurrentLine:!1}},token:function(stream,state){stream.sol()&&(state.currentIndent+=state.nextLineIndent,state.nextLineIndent=0,state.doInCurrentLine=0);var style=tokenLexer(stream,state);return state.lastToken={style:style,content:stream.current()},style},indent:function(state,textAfter,cx){var trueText=textAfter.replace(/^\s+|\s+$/g,"");return trueText.match(closing)||trueText.match(doubleClosing)||trueText.match(middle)?cx.unit*(state.currentIndent-1):0>state.currentIndent?0:state.currentIndent*cx.unit},languageData:{closeBrackets:{brackets:["(","[","{","\""]},commentTokens:{line:"'"},autocomplete:openingKeywords.concat(middleKeywords).concat(endKeywords).concat(operatorKeywords).concat(commonKeywords).concat(commontypes)}};return exports.vb=vb,exports}