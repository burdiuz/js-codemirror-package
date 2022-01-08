async function moduleInitFunction(require,exports={}){function mkVBScript(parserConf){function wordRegexp(words){return new RegExp("^(("+words.join(")|(")+"))\\b","i")}function indent(_stream,state){state.currentIndent++}function dedent(_stream,state){state.currentIndent--}// tokenizers
function tokenBase(stream,state){if(stream.eatSpace())return null;//return null;
var ch=stream.peek();// Handle Comments
if("'"===ch)return stream.skipToEnd(),"comment";if(stream.match(comment))return stream.skipToEnd(),"comment";// Handle Number Literals
if(stream.match(/^((&H)|(&O))?[0-9\.]/i,!1)&&!stream.match(/^((&H)|(&O))?[0-9\.]+[a-z_]/i,!1)){var floatLiteral=!1;// Floats
if(stream.match(/^\d*\.\d+/i)?floatLiteral=!0:stream.match(/^\d+\.\d*/)?floatLiteral=!0:stream.match(/^\.\d+/)&&(floatLiteral=!0),floatLiteral)return stream.eat(/J/i),"number";// Integers
var intLiteral=!1;// Hex
if(stream.match(/^&H[0-9a-f]+/i)?intLiteral=!0:stream.match(/^&O[0-7]+/i)?intLiteral=!0:stream.match(/^[1-9]\d*F?/)?(stream.eat(/J/i),intLiteral=!0):stream.match(/^0(?![\dx])/i)&&(intLiteral=!0),intLiteral)return stream.eat(/L/i),"number"}// Handle Strings
return stream.match("\"")?(state.tokenize=tokenStringFactory(stream.current()),state.tokenize(stream,state)):stream.match(doubleOperators)||stream.match(singleOperators)||stream.match(wordOperators)?"operator":stream.match(singleDelimiters)?null:stream.match(brackets)?"bracket":stream.match(noIndentWords)?(state.doInCurrentLine=!0,"keyword"):stream.match(doOpening)?(indent(stream,state),state.doInCurrentLine=!0,"keyword"):stream.match(opening)?(state.doInCurrentLine?state.doInCurrentLine=!1:indent(stream,state),"keyword"):stream.match(middle)?"keyword":stream.match(doubleClosing)?(dedent(stream,state),dedent(stream,state),"keyword"):stream.match(closing)?(state.doInCurrentLine?state.doInCurrentLine=!1:dedent(stream,state),"keyword"):stream.match(keywords)?"keyword":stream.match(atoms)?"atom":stream.match(known)?"variableName.special":stream.match(builtinFuncs)?"builtin":stream.match(builtinObjs)?"builtin":stream.match(identifiers)?"variable":(stream.next(),"error");// Handle operators and Delimiters
// Handle non-detected items
}function tokenStringFactory(delimiter){var singleline=1==delimiter.length,OUTCLASS="string";return function(stream,state){for(;!stream.eol();){if(stream.eatWhile(/[^'"]/),stream.match(delimiter))return state.tokenize=tokenBase,OUTCLASS;stream.eat(/['"]/)}return singleline&&(state.tokenize=tokenBase),OUTCLASS}}function tokenLexer(stream,state){var style=state.tokenize(stream,state),current=stream.current();// Handle '.' connected identifiers
return"."===current?(style=state.tokenize(stream,state),current=stream.current(),style&&("variable"===style.substr(0,8)||"builtin"===style||"keyword"===style)?(("builtin"===style||"keyword"===style)&&(style="variable"),-1<knownWords.indexOf(current.substr(1))&&(style="keyword"),style):"error"):style}var singleOperators=/^[\+\-\*/&\\\^<>=]/,doubleOperators=/^((<>)|(<=)|(>=))/,singleDelimiters=/^[\.,]/,brackets=/^[\(\)]/,identifiers=/^[A-Za-z][_A-Za-z0-9]*/,wordOperators=wordRegexp(["and","or","not","xor","is","mod","eqv","imp"]),builtinObjsWords=["WScript","err","debug","RegExp"],knownWords=["clear","execute","raise","replace","test","write","writeline","close","open","state","eof","update","addnew","end","createobject","quit"].concat(["description","firstindex","global","helpcontext","helpfile","ignorecase","length","number","pattern","source","value","count"]);builtinObjsWords=builtinObjsWords.concat(["vbBlack","vbRed","vbGreen","vbYellow","vbBlue","vbMagenta","vbCyan","vbWhite","vbBinaryCompare","vbTextCompare","vbSunday","vbMonday","vbTuesday","vbWednesday","vbThursday","vbFriday","vbSaturday","vbUseSystemDayOfWeek","vbFirstJan1","vbFirstFourDays","vbFirstFullWeek","vbGeneralDate","vbLongDate","vbShortDate","vbLongTime","vbShortTime","vbObjectError","vbOKOnly","vbOKCancel","vbAbortRetryIgnore","vbYesNoCancel","vbYesNo","vbRetryCancel","vbCritical","vbQuestion","vbExclamation","vbInformation","vbDefaultButton1","vbDefaultButton2","vbDefaultButton3","vbDefaultButton4","vbApplicationModal","vbSystemModal","vbOK","vbCancel","vbAbort","vbRetry","vbIgnore","vbYes","vbNo","vbCr","VbCrLf","vbFormFeed","vbLf","vbNewLine","vbNullChar","vbNullString","vbTab","vbVerticalTab","vbUseDefault","vbTrue","vbFalse","vbEmpty","vbNull","vbInteger","vbLong","vbSingle","vbDouble","vbCurrency","vbDate","vbString","vbObject","vbError","vbBoolean","vbVariant","vbDataObject","vbDecimal","vbByte","vbArray"]),parserConf.isASP&&(builtinObjsWords=builtinObjsWords.concat(["server","response","request","session","application"]),knownWords=knownWords.concat(["addheader","appendtolog","binarywrite","end","flush","redirect",//response
"binaryread",//request
"remove","removeall","lock","unlock",//application
"abandon",//session
"getlasterror","htmlencode","mappath","transfer","urlencode"],["buffer","cachecontrol","charset","contenttype","expires","expiresabsolute","isclientconnected","pics","status",//response
"clientcertificate","cookies","form","querystring","servervariables","totalbytes",//request
"contents","staticobjects",//application
"codepage","lcid","sessionid","timeout",//session
"scripttimeout"]));var keywords=wordRegexp(["dim","redim","then","until","randomize","byval","byref","new","property","exit","in","const","private","public","get","set","let","stop","on error resume next","on error goto 0","option explicit","call","me"]),atoms=wordRegexp(["true","false","nothing","empty","null"]),builtinFuncs=wordRegexp(["abs","array","asc","atn","cbool","cbyte","ccur","cdate","cdbl","chr","cint","clng","cos","csng","cstr","date","dateadd","datediff","datepart","dateserial","datevalue","day","escape","eval","execute","exp","filter","formatcurrency","formatdatetime","formatnumber","formatpercent","getlocale","getobject","getref","hex","hour","inputbox","instr","instrrev","int","fix","isarray","isdate","isempty","isnull","isnumeric","isobject","join","lbound","lcase","left","len","loadpicture","log","ltrim","rtrim","trim","maths","mid","minute","month","monthname","msgbox","now","oct","replace","rgb","right","rnd","round","scriptengine","scriptenginebuildversion","scriptenginemajorversion","scriptengineminorversion","second","setlocale","sgn","sin","space","split","sqr","strcomp","string","strreverse","tan","time","timer","timeserial","timevalue","typename","ubound","ucase","unescape","vartype","weekday","weekdayname","year"]),builtinObjs=wordRegexp(builtinObjsWords),known=wordRegexp(knownWords),opening=wordRegexp(["class","sub","select","while","if","function","property","with","for"]),middle=wordRegexp(["else","elseif","case"]),closing=wordRegexp(["next","loop","wend"]),doubleClosing=wordRegexp(["end"]),doOpening=wordRegexp(["do"]),noIndentWords=wordRegexp(["on error resume next","exit"]),comment=wordRegexp(["rem"]);return{startState:function(){return{tokenize:tokenBase,lastToken:null,currentIndent:0,nextLineIndent:0,doInCurrentLine:!1,ignoreKeyword:!1}},token:function(stream,state){stream.sol()&&(state.currentIndent+=state.nextLineIndent,state.nextLineIndent=0,state.doInCurrentLine=0);var style=tokenLexer(stream,state);return state.lastToken={style:style,content:stream.current()},null===style&&(style=null),style},indent:function(state,textAfter,cx){var trueText=textAfter.replace(/^\s+|\s+$/g,"");return trueText.match(closing)||trueText.match(doubleClosing)||trueText.match(middle)?cx.unit*(state.currentIndent-1):0>state.currentIndent?0:state.currentIndent*cx.unit}}}Object.defineProperty(exports,"__esModule",{value:!0});const vbScript=mkVBScript({}),vbScriptASP=mkVBScript({isASP:!0});return exports.vbScript=vbScript,exports.vbScriptASP=vbScriptASP,exports}