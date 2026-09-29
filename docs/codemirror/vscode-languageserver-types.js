async function moduleInitFunction(requireAsyncModule,exports={}){function commonjsRequire(path){throw new Error("Could not dynamically require \""+path+"\". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.")}const module={exports:exports};var hasRequiredMain,main$1={exports:{}},mainExports=function requireMain(){return hasRequiredMain?main$1.exports:(hasRequiredMain=1,function(module,exports){(function(factory){{var v=factory(commonjsRequire,exports);void 0!==v&&(module.exports=v)}})(function(require,exports){Object.defineProperty(exports,"__esModule",{value:!0}),exports.TextDocument=exports.EOL=exports.WorkspaceFolder=exports.InlineCompletionContext=exports.SelectedCompletionInfo=exports.InlineCompletionTriggerKind=exports.InlineCompletionList=exports.InlineCompletionItem=exports.StringValue=exports.InlayHint=exports.InlayHintLabelPart=exports.InlayHintKind=exports.InlineValueContext=exports.InlineValueEvaluatableExpression=exports.InlineValueVariableLookup=exports.InlineValueText=exports.SemanticTokens=exports.SemanticTokenModifiers=exports.SemanticTokenTypes=exports.SelectionRange=exports.DocumentLink=exports.FormattingOptions=exports.CodeLens=exports.CodeAction=exports.CodeActionTag=exports.CodeActionContext=exports.CodeActionTriggerKind=exports.CodeActionKind=exports.DocumentSymbol=exports.WorkspaceSymbol=exports.SymbolInformation=exports.SymbolTag=exports.SymbolKind=exports.DocumentHighlight=exports.DocumentHighlightKind=exports.SignatureInformation=exports.ParameterInformation=exports.Hover=exports.MarkedString=exports.CompletionList=exports.CompletionItem=exports.CompletionItemLabelDetails=exports.ApplyKind=exports.InsertTextMode=exports.InsertReplaceEdit=exports.CompletionItemTag=exports.InsertTextFormat=exports.CompletionItemKind=exports.MarkupContent=exports.MarkupKind=exports.TextDocumentItem=exports.LanguageKind=exports.OptionalVersionedTextDocumentIdentifier=exports.VersionedTextDocumentIdentifier=exports.TextDocumentIdentifier=exports.WorkspaceChange=exports.SnippetTextEdit=exports.WorkspaceEdit=exports.DeleteFile=exports.RenameFile=exports.CreateFile=exports.TextDocumentEdit=exports.AnnotatedTextEdit=exports.ChangeAnnotationIdentifier=exports.ChangeAnnotation=exports.TextEdit=exports.Command=exports.Diagnostic=exports.CodeDescription=exports.DiagnosticTag=exports.DiagnosticSeverity=exports.DiagnosticRelatedInformation=exports.FoldingRange=exports.FoldingRangeKind=exports.ColorPresentation=exports.ColorInformation=exports.Color=exports.LocationLink=exports.Location=exports.Range=exports.Position=exports.uinteger=exports.integer=exports.URI=exports.DocumentUri=void 0;var DocumentUri;(function(DocumentUri){function is(value){return"string"==typeof value}DocumentUri.is=is})(DocumentUri||(exports.DocumentUri=DocumentUri={}));var URI;(function(URI){function is(value){return"string"==typeof value}URI.is=is})(URI||(exports.URI=URI={}));var integer;(function(integer){function is(value){return"number"==typeof value&&integer.MIN_VALUE<=value&&value<=integer.MAX_VALUE}integer.MIN_VALUE=-2147483648,integer.MAX_VALUE=2147483647,integer.is=is})(integer||(exports.integer=integer={}));var uinteger;(function(uinteger){function is(value){return"number"==typeof value&&uinteger.MIN_VALUE<=value&&value<=uinteger.MAX_VALUE}uinteger.MIN_VALUE=0,uinteger.MAX_VALUE=2147483647,uinteger.is=is})(uinteger||(exports.uinteger=uinteger={}));/**
		     * The Position namespace provides helper functions to work with
		     * {@link Position} literals.
		     */var Position;(function(Position){/**
		         * Creates a new Position literal from the given line and character.
		         * @param line The position's line.
		         * @param character The position's character.
		         */function create(line,character){return line===Number.MAX_VALUE&&(line=uinteger.MAX_VALUE),character===Number.MAX_VALUE&&(character=uinteger.MAX_VALUE),{line:line,character:character}}/**
		         * Checks whether the given literal conforms to the {@link Position} interface.
		         */function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Is.uinteger(candidate.line)&&Is.uinteger(candidate.character)}Position.create=create,Position.is=is})(Position||(exports.Position=Position={}));/**
		     * The Range namespace provides helper functions to work with
		     * {@link Range} literals.
		     */var Range;(function(Range){function create(one,two,three,four){if(Is.uinteger(one)&&Is.uinteger(two)&&Is.uinteger(three)&&Is.uinteger(four))return{start:Position.create(one,two),end:Position.create(three,four)};if(Position.is(one)&&Position.is(two))return{start:one,end:two};throw new Error("Range#create called with invalid arguments[".concat(one,", ").concat(two,", ").concat(three,", ").concat(four,"]"))}/**
		         * Checks whether the given literal conforms to the {@link Range} interface.
		         */function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Position.is(candidate.start)&&Position.is(candidate.end)}Range.create=create,Range.is=is})(Range||(exports.Range=Range={}));/**
		     * The Location namespace provides helper functions to work with
		     * {@link Location} literals.
		     */var Location;(function(Location){/**
		         * Creates a Location literal.
		         * @param uri The location's uri.
		         * @param range The location's range.
		         */function create(uri,range){return{uri:uri,range:range}}/**
		         * Checks whether the given literal conforms to the {@link Location} interface.
		         */function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Range.is(candidate.range)&&(Is.string(candidate.uri)||Is.undefined(candidate.uri))}Location.create=create,Location.is=is})(Location||(exports.Location=Location={}));/**
		     * The LocationLink namespace provides helper functions to work with
		     * {@link LocationLink} literals.
		     */var LocationLink;(function(LocationLink){/**
		         * Creates a LocationLink literal.
		         * @param targetUri The definition's uri.
		         * @param targetRange The full range of the definition.
		         * @param targetSelectionRange The span of the symbol definition at the target.
		         * @param originSelectionRange The span of the symbol being defined in the originating source file.
		         */function create(targetUri,targetRange,targetSelectionRange,originSelectionRange){return{targetUri:targetUri,targetRange:targetRange,targetSelectionRange:targetSelectionRange,originSelectionRange:originSelectionRange}}/**
		         * Checks whether the given literal conforms to the {@link LocationLink} interface.
		         */function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Range.is(candidate.targetRange)&&Is.string(candidate.targetUri)&&Range.is(candidate.targetSelectionRange)&&(Range.is(candidate.originSelectionRange)||Is.undefined(candidate.originSelectionRange))}LocationLink.create=create,LocationLink.is=is})(LocationLink||(exports.LocationLink=LocationLink={}));/**
		     * The Color namespace provides helper functions to work with
		     * {@link Color} literals.
		     */var Color;(function(Color){/**
		         * Creates a new Color literal.
		         */function create(red,green,blue,alpha){return{red:red,green:green,blue:blue,alpha:alpha}}/**
		         * Checks whether the given literal conforms to the {@link Color} interface.
		         */function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Is.numberRange(candidate.red,0,1)&&Is.numberRange(candidate.green,0,1)&&Is.numberRange(candidate.blue,0,1)&&Is.numberRange(candidate.alpha,0,1)}Color.create=create,Color.is=is})(Color||(exports.Color=Color={}));/**
		     * The ColorInformation namespace provides helper functions to work with
		     * {@link ColorInformation} literals.
		     */var ColorInformation;(function(ColorInformation){/**
		         * Creates a new ColorInformation literal.
		         */function create(range,color){return{range:range,color:color}}/**
		         * Checks whether the given literal conforms to the {@link ColorInformation} interface.
		         */function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Range.is(candidate.range)&&Color.is(candidate.color)}ColorInformation.create=create,ColorInformation.is=is})(ColorInformation||(exports.ColorInformation=ColorInformation={}));/**
		     * The Color namespace provides helper functions to work with
		     * {@link ColorPresentation} literals.
		     */var ColorPresentation;(function(ColorPresentation){/**
		         * Creates a new ColorInformation literal.
		         */function create(label,textEdit,additionalTextEdits){return{label:label,textEdit:textEdit,additionalTextEdits:additionalTextEdits}}/**
		         * Checks whether the given literal conforms to the {@link ColorInformation} interface.
		         */function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Is.string(candidate.label)&&(Is.undefined(candidate.textEdit)||TextEdit.is(candidate))&&(Is.undefined(candidate.additionalTextEdits)||Is.typedArray(candidate.additionalTextEdits,TextEdit.is))}ColorPresentation.create=create,ColorPresentation.is=is})(ColorPresentation||(exports.ColorPresentation=ColorPresentation={}));/**
		     * A set of predefined range kinds.
		     */var FoldingRangeKind;(function(FoldingRangeKind){FoldingRangeKind.Comment="comment",FoldingRangeKind.Imports="imports",FoldingRangeKind.Region="region"})(FoldingRangeKind||(exports.FoldingRangeKind=FoldingRangeKind={}));/**
		     * The folding range namespace provides helper functions to work with
		     * {@link FoldingRange} literals.
		     */var FoldingRange;(function(FoldingRange){/**
		         * Creates a new FoldingRange literal.
		         */function create(startLine,endLine,startCharacter,endCharacter,kind,collapsedText){var result={startLine:startLine,endLine:endLine};return Is.defined(startCharacter)&&(result.startCharacter=startCharacter),Is.defined(endCharacter)&&(result.endCharacter=endCharacter),Is.defined(kind)&&(result.kind=kind),Is.defined(collapsedText)&&(result.collapsedText=collapsedText),result}/**
		         * Checks whether the given literal conforms to the {@link FoldingRange} interface.
		         */function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Is.uinteger(candidate.startLine)&&Is.uinteger(candidate.startLine)&&(Is.undefined(candidate.startCharacter)||Is.uinteger(candidate.startCharacter))&&(Is.undefined(candidate.endCharacter)||Is.uinteger(candidate.endCharacter))&&(Is.undefined(candidate.kind)||Is.string(candidate.kind))}FoldingRange.create=create,FoldingRange.is=is})(FoldingRange||(exports.FoldingRange=FoldingRange={}));/**
		     * The DiagnosticRelatedInformation namespace provides helper functions to work with
		     * {@link DiagnosticRelatedInformation} literals.
		     */var DiagnosticRelatedInformation;(function(DiagnosticRelatedInformation){/**
		         * Creates a new DiagnosticRelatedInformation literal.
		         */function create(location,message){return{location:location,message:message}}/**
		         * Checks whether the given literal conforms to the {@link DiagnosticRelatedInformation} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Location.is(candidate.location)&&Is.string(candidate.message)}DiagnosticRelatedInformation.create=create,DiagnosticRelatedInformation.is=is})(DiagnosticRelatedInformation||(exports.DiagnosticRelatedInformation=DiagnosticRelatedInformation={}));/**
		     * The diagnostic's severity.
		     */var DiagnosticSeverity;(function(DiagnosticSeverity){DiagnosticSeverity.Error=1,DiagnosticSeverity.Warning=2,DiagnosticSeverity.Information=3,DiagnosticSeverity.Hint=4})(DiagnosticSeverity||(exports.DiagnosticSeverity=DiagnosticSeverity={}));/**
		     * The diagnostic tags.
		     *
		     * @since 3.15.0
		     */var DiagnosticTag;(function(DiagnosticTag){DiagnosticTag.Unnecessary=1,DiagnosticTag.Deprecated=2})(DiagnosticTag||(exports.DiagnosticTag=DiagnosticTag={}));/**
		     * The CodeDescription namespace provides functions to deal with descriptions for diagnostic codes.
		     *
		     * @since 3.16.0
		     */var CodeDescription;(function(CodeDescription){function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Is.string(candidate.href)}CodeDescription.is=is})(CodeDescription||(exports.CodeDescription=CodeDescription={}));/**
		     * The Diagnostic namespace provides helper functions to work with
		     * {@link Diagnostic} literals.
		     */var Diagnostic;(function(Diagnostic){/**
		         * Creates a new Diagnostic literal.
		         */function create(range,message,severity,code,source,relatedInformation){var result={range:range,message:message};return Is.defined(severity)&&(result.severity=severity),Is.defined(code)&&(result.code=code),Is.defined(source)&&(result.source=source),Is.defined(relatedInformation)&&(result.relatedInformation=relatedInformation),result}/**
		         * Checks whether the given literal conforms to the {@link Diagnostic} interface.
		         */function is(value){var _a,candidate=value;return Is.defined(candidate)&&Range.is(candidate.range)&&(Is.string(candidate.message)||MarkupContent.is(candidate.message))&&(Is.number(candidate.severity)||Is.undefined(candidate.severity))&&(Is.integer(candidate.code)||Is.string(candidate.code)||Is.undefined(candidate.code))&&(Is.undefined(candidate.codeDescription)||Is.string(null===(_a=candidate.codeDescription)||void 0===_a?void 0:_a.href))&&(Is.string(candidate.source)||Is.undefined(candidate.source))&&(Is.undefined(candidate.relatedInformation)||Is.typedArray(candidate.relatedInformation,DiagnosticRelatedInformation.is))}/**
		         * Checks whether the given diagnostic's message conforms to the 3.17.0
		         * version of the protocol where the message is a string.
		         *
		         * @param value the diagnostic
		         * @returns true if the diagnostic's message is a string, false otherwise.
		         */function is3_17(value){return Is.string(value.message)}/**
		         * Gets the message string of a diagnostic. If the message is already a
		         * string, it is returned as is. If the message is a MarkupContent,
		         * the value of the MarkupContent is returned. Otherwise an error is thrown.
		         *
		         * @param diagnostic the diagnostic to get the message string from.
		         * @returns the message string of the given diagnostic.
		         */function getMessageString(diagnostic){if(Is.string(diagnostic.message))return diagnostic.message;if(MarkupContent.is(diagnostic.message))return diagnostic.message.value;throw new Error("Unknown message type ".concat(typeof diagnostic.message))}Diagnostic.create=create,Diagnostic.is=is,Diagnostic.is3_17=is3_17,Diagnostic.getMessageString=getMessageString})(Diagnostic||(exports.Diagnostic=Diagnostic={}));/**
		     * The Command namespace provides helper functions to work with
		     * {@link Command} literals.
		     */var Command;(function(Command){/**
		         * Creates a new Command literal.
		         */function create(title,command){for(var args=[],_i=2;_i<arguments.length;_i++)args[_i-2]=arguments[_i];var result={title:title,command:command};return Is.defined(args)&&0<args.length&&(result.arguments=args),result}/**
		         * Checks whether the given literal conforms to the {@link Command} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Is.string(candidate.title)&&(void 0===candidate.tooltip||Is.string(candidate.tooltip))&&Is.string(candidate.command)}Command.create=create,Command.is=is})(Command||(exports.Command=Command={}));/**
		     * The TextEdit namespace provides helper function to create replace,
		     * insert and delete edits more easily.
		     */var TextEdit;(function(TextEdit){/**
		         * Creates a replace text edit.
		         * @param range The range of text to be replaced.
		         * @param newText The new text.
		         */function replace(range,newText){return{range:range,newText:newText}}/**
		         * Creates an insert text edit.
		         * @param position The position to insert the text at.
		         * @param newText The text to be inserted.
		         */function insert(position,newText){return{range:{start:position,end:position},newText:newText}}/**
		         * Creates a delete text edit.
		         * @param range The range of text to be deleted.
		         */function del(range){return{range:range,newText:""}}function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Is.string(candidate.newText)&&Range.is(candidate.range)}TextEdit.replace=replace,TextEdit.insert=insert,TextEdit.del=del,TextEdit.is=is})(TextEdit||(exports.TextEdit=TextEdit={}));var ChangeAnnotation;(function(ChangeAnnotation){function create(label,needsConfirmation,description){var result={label:label};return void 0!==needsConfirmation&&(result.needsConfirmation=needsConfirmation),void 0!==description&&(result.description=description),result}function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Is.string(candidate.label)&&(Is.boolean(candidate.needsConfirmation)||void 0===candidate.needsConfirmation)&&(Is.string(candidate.description)||void 0===candidate.description)}ChangeAnnotation.create=create,ChangeAnnotation.is=is})(ChangeAnnotation||(exports.ChangeAnnotation=ChangeAnnotation={}));var ChangeAnnotationIdentifier;(function(ChangeAnnotationIdentifier){function is(value){var candidate=value;return Is.string(candidate)}ChangeAnnotationIdentifier.is=is})(ChangeAnnotationIdentifier||(exports.ChangeAnnotationIdentifier=ChangeAnnotationIdentifier={}));var AnnotatedTextEdit;(function(AnnotatedTextEdit){/**
		         * Creates an annotated replace text edit.
		         *
		         * @param range The range of text to be replaced.
		         * @param newText The new text.
		         * @param annotation The annotation.
		         */function replace(range,newText,annotation){return{range:range,newText:newText,annotationId:annotation}}/**
		         * Creates an annotated insert text edit.
		         *
		         * @param position The position to insert the text at.
		         * @param newText The text to be inserted.
		         * @param annotation The annotation.
		         */function insert(position,newText,annotation){return{range:{start:position,end:position},newText:newText,annotationId:annotation}}/**
		         * Creates an annotated delete text edit.
		         *
		         * @param range The range of text to be deleted.
		         * @param annotation The annotation.
		         */function del(range,annotation){return{range:range,newText:"",annotationId:annotation}}function is(value){var candidate=value;return TextEdit.is(candidate)&&(ChangeAnnotation.is(candidate.annotationId)||ChangeAnnotationIdentifier.is(candidate.annotationId))}AnnotatedTextEdit.replace=replace,AnnotatedTextEdit.insert=insert,AnnotatedTextEdit.del=del,AnnotatedTextEdit.is=is})(AnnotatedTextEdit||(exports.AnnotatedTextEdit=AnnotatedTextEdit={}));/**
		     * The TextDocumentEdit namespace provides helper function to create
		     * an edit that manipulates a text document.
		     */var TextDocumentEdit;(function(TextDocumentEdit){/**
		         * Creates a new `TextDocumentEdit`
		         */function create(textDocument,edits){return{textDocument:textDocument,edits:edits}}function is(value){var candidate=value;return Is.defined(candidate)&&OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument)&&Array.isArray(candidate.edits)}TextDocumentEdit.create=create,TextDocumentEdit.is=is})(TextDocumentEdit||(exports.TextDocumentEdit=TextDocumentEdit={}));var CreateFile;(function(CreateFile){function create(uri,options,annotation){var result={kind:"create",uri:uri};return void 0!==options&&(void 0!==options.overwrite||void 0!==options.ignoreIfExists)&&(result.options=options),void 0!==annotation&&(result.annotationId=annotation),result}function is(value){var candidate=value;return candidate&&"create"===candidate.kind&&Is.string(candidate.uri)&&(void 0===candidate.options||(void 0===candidate.options.overwrite||Is.boolean(candidate.options.overwrite))&&(void 0===candidate.options.ignoreIfExists||Is.boolean(candidate.options.ignoreIfExists)))&&(void 0===candidate.annotationId||ChangeAnnotationIdentifier.is(candidate.annotationId))}CreateFile.create=create,CreateFile.is=is})(CreateFile||(exports.CreateFile=CreateFile={}));var RenameFile;(function(RenameFile){function create(oldUri,newUri,options,annotation){var result={kind:"rename",oldUri:oldUri,newUri:newUri};return void 0!==options&&(void 0!==options.overwrite||void 0!==options.ignoreIfExists)&&(result.options=options),void 0!==annotation&&(result.annotationId=annotation),result}function is(value){var candidate=value;return candidate&&"rename"===candidate.kind&&Is.string(candidate.oldUri)&&Is.string(candidate.newUri)&&(void 0===candidate.options||(void 0===candidate.options.overwrite||Is.boolean(candidate.options.overwrite))&&(void 0===candidate.options.ignoreIfExists||Is.boolean(candidate.options.ignoreIfExists)))&&(void 0===candidate.annotationId||ChangeAnnotationIdentifier.is(candidate.annotationId))}RenameFile.create=create,RenameFile.is=is})(RenameFile||(exports.RenameFile=RenameFile={}));var DeleteFile;(function(DeleteFile){function create(uri,options,annotation){var result={kind:"delete",uri:uri};return void 0!==options&&(void 0!==options.recursive||void 0!==options.ignoreIfNotExists)&&(result.options=options),void 0!==annotation&&(result.annotationId=annotation),result}function is(value){var candidate=value;return candidate&&"delete"===candidate.kind&&Is.string(candidate.uri)&&(void 0===candidate.options||(void 0===candidate.options.recursive||Is.boolean(candidate.options.recursive))&&(void 0===candidate.options.ignoreIfNotExists||Is.boolean(candidate.options.ignoreIfNotExists)))&&(void 0===candidate.annotationId||ChangeAnnotationIdentifier.is(candidate.annotationId))}DeleteFile.create=create,DeleteFile.is=is})(DeleteFile||(exports.DeleteFile=DeleteFile={}));var WorkspaceEdit;(function(WorkspaceEdit){function is(value){var candidate=value;return candidate&&(void 0!==candidate.changes||void 0!==candidate.documentChanges)&&(void 0===candidate.documentChanges||candidate.documentChanges.every(function(change){return Is.string(change.kind)?CreateFile.is(change)||RenameFile.is(change)||DeleteFile.is(change):TextDocumentEdit.is(change)}))}WorkspaceEdit.is=is})(WorkspaceEdit||(exports.WorkspaceEdit=WorkspaceEdit={}));var SnippetTextEdit,TextEditChangeImpl=/** @class */function(){function TextEditChangeImpl(edits,changeAnnotations){this.edits=edits,this.changeAnnotations=changeAnnotations}return TextEditChangeImpl.prototype.insert=function(position,newText,annotation){var edit,id;if(void 0===annotation?edit=TextEdit.insert(position,newText):ChangeAnnotationIdentifier.is(annotation)?(id=annotation,edit=AnnotatedTextEdit.insert(position,newText,annotation)):(this.assertChangeAnnotations(this.changeAnnotations),id=this.changeAnnotations.manage(annotation),edit=AnnotatedTextEdit.insert(position,newText,id)),this.edits.push(edit),void 0!==id)return id},TextEditChangeImpl.prototype.replace=function(range,newText,annotation){var edit,id;if(void 0===annotation?edit=TextEdit.replace(range,newText):ChangeAnnotationIdentifier.is(annotation)?(id=annotation,edit=AnnotatedTextEdit.replace(range,newText,annotation)):(this.assertChangeAnnotations(this.changeAnnotations),id=this.changeAnnotations.manage(annotation),edit=AnnotatedTextEdit.replace(range,newText,id)),this.edits.push(edit),void 0!==id)return id},TextEditChangeImpl.prototype.delete=function(range,annotation){var edit,id;if(void 0===annotation?edit=TextEdit.del(range):ChangeAnnotationIdentifier.is(annotation)?(id=annotation,edit=AnnotatedTextEdit.del(range,annotation)):(this.assertChangeAnnotations(this.changeAnnotations),id=this.changeAnnotations.manage(annotation),edit=AnnotatedTextEdit.del(range,id)),this.edits.push(edit),void 0!==id)return id},TextEditChangeImpl.prototype.add=function(edit){this.edits.push(edit)},TextEditChangeImpl.prototype.all=function(){return this.edits},TextEditChangeImpl.prototype.clear=function(){this.edits.splice(0,this.edits.length)},TextEditChangeImpl.prototype.assertChangeAnnotations=function(value){if(void 0===value)throw new Error("Text edit change is not configured to manage change annotations.")},TextEditChangeImpl}();(function(SnippetTextEdit){function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Range.is(candidate.range)&&StringValue.isSnippet(candidate.snippet)&&(void 0===candidate.annotationId||ChangeAnnotation.is(candidate.annotationId)||ChangeAnnotationIdentifier.is(candidate.annotationId))}SnippetTextEdit.is=is})(SnippetTextEdit||(exports.SnippetTextEdit=SnippetTextEdit={}));/**
		     * A helper class
		     */var ChangeAnnotations=/** @class */function(){function ChangeAnnotations(annotations){this._annotations=void 0===annotations?Object.create(null):annotations,this._counter=0,this._size=0}return ChangeAnnotations.prototype.all=function(){return this._annotations},Object.defineProperty(ChangeAnnotations.prototype,"size",{get:function(){return this._size},enumerable:!1,configurable:!0}),ChangeAnnotations.prototype.manage=function(idOrAnnotation,annotation){var id;if(ChangeAnnotationIdentifier.is(idOrAnnotation)?id=idOrAnnotation:(id=this.nextId(),annotation=idOrAnnotation),void 0!==this._annotations[id])throw new Error("Id ".concat(id," is already in use."));if(void 0===annotation)throw new Error("No annotation provided for id ".concat(id));return this._annotations[id]=annotation,this._size++,id},ChangeAnnotations.prototype.nextId=function(){return this._counter++,this._counter.toString()},ChangeAnnotations}(),WorkspaceChange=/** @class */function(){function WorkspaceChange(workspaceEdit){var _this=this;this._textEditChanges=Object.create(null),void 0===workspaceEdit?this._workspaceEdit={}:(this._workspaceEdit=workspaceEdit,workspaceEdit.documentChanges?(this._changeAnnotations=new ChangeAnnotations(workspaceEdit.changeAnnotations),workspaceEdit.changeAnnotations=this._changeAnnotations.all(),workspaceEdit.documentChanges.forEach(function(change){if(TextDocumentEdit.is(change)){var textEditChange=new TextEditChangeImpl(change.edits,_this._changeAnnotations);_this._textEditChanges[change.textDocument.uri]=textEditChange}})):workspaceEdit.changes&&Object.keys(workspaceEdit.changes).forEach(function(key){var textEditChange=new TextEditChangeImpl(workspaceEdit.changes[key]);_this._textEditChanges[key]=textEditChange}))}return Object.defineProperty(WorkspaceChange.prototype,"edit",{/**
		             * Returns the underlying {@link WorkspaceEdit} literal
		             * use to be returned from a workspace edit operation like rename.
		             */get:function(){return this.initDocumentChanges(),void 0!==this._changeAnnotations&&(0===this._changeAnnotations.size?this._workspaceEdit.changeAnnotations=void 0:this._workspaceEdit.changeAnnotations=this._changeAnnotations.all()),this._workspaceEdit},enumerable:!1,configurable:!0}),WorkspaceChange.prototype.getTextEditChange=function(key){if(OptionalVersionedTextDocumentIdentifier.is(key)){if(this.initDocumentChanges(),void 0===this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.");var textDocument={uri:key.uri,version:key.version},result=this._textEditChanges[textDocument.uri];if(!result){var edits=[],textDocumentEdit={textDocument:textDocument,edits:edits};this._workspaceEdit.documentChanges.push(textDocumentEdit),result=new TextEditChangeImpl(edits,this._changeAnnotations),this._textEditChanges[textDocument.uri]=result}return result}if(this.initChanges(),void 0===this._workspaceEdit.changes)throw new Error("Workspace edit is not configured for normal text edit changes.");var result=this._textEditChanges[key];if(!result){var edits=[];this._workspaceEdit.changes[key]=edits,result=new TextEditChangeImpl(edits),this._textEditChanges[key]=result}return result},WorkspaceChange.prototype.initDocumentChanges=function(){void 0===this._workspaceEdit.documentChanges&&void 0===this._workspaceEdit.changes&&(this._changeAnnotations=new ChangeAnnotations,this._workspaceEdit.documentChanges=[],this._workspaceEdit.changeAnnotations=this._changeAnnotations.all())},WorkspaceChange.prototype.initChanges=function(){void 0===this._workspaceEdit.documentChanges&&void 0===this._workspaceEdit.changes&&(this._workspaceEdit.changes=Object.create(null))},WorkspaceChange.prototype.createFile=function(uri,optionsOrAnnotation,options){if(this.initDocumentChanges(),void 0===this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.");var annotation;ChangeAnnotation.is(optionsOrAnnotation)||ChangeAnnotationIdentifier.is(optionsOrAnnotation)?annotation=optionsOrAnnotation:options=optionsOrAnnotation;var operation,id;if(void 0===annotation?operation=CreateFile.create(uri,options):(id=ChangeAnnotationIdentifier.is(annotation)?annotation:this._changeAnnotations.manage(annotation),operation=CreateFile.create(uri,options,id)),this._workspaceEdit.documentChanges.push(operation),void 0!==id)return id},WorkspaceChange.prototype.renameFile=function(oldUri,newUri,optionsOrAnnotation,options){if(this.initDocumentChanges(),void 0===this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.");var annotation;ChangeAnnotation.is(optionsOrAnnotation)||ChangeAnnotationIdentifier.is(optionsOrAnnotation)?annotation=optionsOrAnnotation:options=optionsOrAnnotation;var operation,id;if(void 0===annotation?operation=RenameFile.create(oldUri,newUri,options):(id=ChangeAnnotationIdentifier.is(annotation)?annotation:this._changeAnnotations.manage(annotation),operation=RenameFile.create(oldUri,newUri,options,id)),this._workspaceEdit.documentChanges.push(operation),void 0!==id)return id},WorkspaceChange.prototype.deleteFile=function(uri,optionsOrAnnotation,options){if(this.initDocumentChanges(),void 0===this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.");var annotation;ChangeAnnotation.is(optionsOrAnnotation)||ChangeAnnotationIdentifier.is(optionsOrAnnotation)?annotation=optionsOrAnnotation:options=optionsOrAnnotation;var operation,id;if(void 0===annotation?operation=DeleteFile.create(uri,options):(id=ChangeAnnotationIdentifier.is(annotation)?annotation:this._changeAnnotations.manage(annotation),operation=DeleteFile.create(uri,options,id)),this._workspaceEdit.documentChanges.push(operation),void 0!==id)return id},WorkspaceChange}();/**
		     * A workspace change helps constructing changes to a workspace.
		     */exports.WorkspaceChange=WorkspaceChange;/**
		     * The TextDocumentIdentifier namespace provides helper functions to work with
		     * {@link TextDocumentIdentifier} literals.
		     */var TextDocumentIdentifier;(function(TextDocumentIdentifier){/**
		         * Creates a new TextDocumentIdentifier literal.
		         * @param uri The document's uri.
		         */function create(uri){return{uri:uri}}/**
		         * Checks whether the given literal conforms to the {@link TextDocumentIdentifier} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Is.string(candidate.uri)}TextDocumentIdentifier.create=create,TextDocumentIdentifier.is=is})(TextDocumentIdentifier||(exports.TextDocumentIdentifier=TextDocumentIdentifier={}));/**
		     * The VersionedTextDocumentIdentifier namespace provides helper functions to work with
		     * {@link VersionedTextDocumentIdentifier} literals.
		     */var VersionedTextDocumentIdentifier;(function(VersionedTextDocumentIdentifier){/**
		         * Creates a new VersionedTextDocumentIdentifier literal.
		         * @param uri The document's uri.
		         * @param version The document's version.
		         */function create(uri,version){return{uri:uri,version:version}}/**
		         * Checks whether the given literal conforms to the {@link VersionedTextDocumentIdentifier} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Is.string(candidate.uri)&&Is.integer(candidate.version)}VersionedTextDocumentIdentifier.create=create,VersionedTextDocumentIdentifier.is=is})(VersionedTextDocumentIdentifier||(exports.VersionedTextDocumentIdentifier=VersionedTextDocumentIdentifier={}));/**
		     * The OptionalVersionedTextDocumentIdentifier namespace provides helper functions to work with
		     * {@link OptionalVersionedTextDocumentIdentifier} literals.
		     */var OptionalVersionedTextDocumentIdentifier;(function(OptionalVersionedTextDocumentIdentifier){/**
		         * Creates a new OptionalVersionedTextDocumentIdentifier literal.
		         * @param uri The document's uri.
		         * @param version The document's version.
		         */function create(uri,version){return{uri:uri,version:version}}/**
		         * Checks whether the given literal conforms to the {@link OptionalVersionedTextDocumentIdentifier} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Is.string(candidate.uri)&&(null===candidate.version||Is.integer(candidate.version))}OptionalVersionedTextDocumentIdentifier.create=create,OptionalVersionedTextDocumentIdentifier.is=is})(OptionalVersionedTextDocumentIdentifier||(exports.OptionalVersionedTextDocumentIdentifier=OptionalVersionedTextDocumentIdentifier={}));/**
		     * Predefined Language kinds
		     * @since 3.18.0
		     */var LanguageKind;(function(LanguageKind){LanguageKind.ABAP="abap",LanguageKind.WindowsBat="bat",LanguageKind.BibTeX="bibtex",LanguageKind.Clojure="clojure",LanguageKind.Coffeescript="coffeescript",LanguageKind.C="c",LanguageKind.CPP="cpp",LanguageKind.CSharp="csharp",LanguageKind.CSS="css",LanguageKind.D="d",LanguageKind.Delphi="pascal",LanguageKind.Diff="diff",LanguageKind.Dart="dart",LanguageKind.Dockerfile="dockerfile",LanguageKind.Elixir="elixir",LanguageKind.Erlang="erlang",LanguageKind.FSharp="fsharp",LanguageKind.GitCommit="git-commit",LanguageKind.GitRebase="git-rebase",LanguageKind.Go="go",LanguageKind.Groovy="groovy",LanguageKind.Handlebars="handlebars",LanguageKind.Haskell="haskell",LanguageKind.HTML="html",LanguageKind.Ini="ini",LanguageKind.Java="java",LanguageKind.JavaScript="javascript",LanguageKind.JavaScriptReact="javascriptreact",LanguageKind.JSON="json",LanguageKind.LaTeX="latex",LanguageKind.Less="less",LanguageKind.Lua="lua",LanguageKind.Makefile="makefile",LanguageKind.Markdown="markdown",LanguageKind.ObjectiveC="objective-c",LanguageKind.ObjectiveCPP="objective-cpp",LanguageKind.Pascal="pascal",LanguageKind.Perl="perl",LanguageKind.Perl6="perl6",LanguageKind.PHP="php",LanguageKind.Plaintext="plaintext",LanguageKind.Powershell="powershell",LanguageKind.Pug="jade",LanguageKind.Python="python",LanguageKind.R="r",LanguageKind.Razor="razor",LanguageKind.Ruby="ruby",LanguageKind.Rust="rust",LanguageKind.SCSS="scss",LanguageKind.SASS="sass",LanguageKind.Scala="scala",LanguageKind.ShaderLab="shaderlab",LanguageKind.ShellScript="shellscript",LanguageKind.SQL="sql",LanguageKind.Swift="swift",LanguageKind.TypeScript="typescript",LanguageKind.TypeScriptReact="typescriptreact",LanguageKind.TeX="tex",LanguageKind.VisualBasic="vb",LanguageKind.XML="xml",LanguageKind.XSL="xsl",LanguageKind.YAML="yaml"})(LanguageKind||(exports.LanguageKind=LanguageKind={}));/**
		     * The TextDocumentItem namespace provides helper functions to work with
		     * {@link TextDocumentItem} literals.
		     */var TextDocumentItem;(function(TextDocumentItem){/**
		         * Creates a new TextDocumentItem literal.
		         * @param uri The document's uri.
		         * @param languageId The document's language identifier.
		         * @param version The document's version number.
		         * @param text The document's text.
		         */function create(uri,languageId,version,text){return{uri:uri,languageId:languageId,version:version,text:text}}/**
		         * Checks whether the given literal conforms to the {@link TextDocumentItem} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Is.string(candidate.uri)&&Is.string(candidate.languageId)&&Is.integer(candidate.version)&&Is.string(candidate.text)}TextDocumentItem.create=create,TextDocumentItem.is=is})(TextDocumentItem||(exports.TextDocumentItem=TextDocumentItem={}));/**
		     * Describes the content type that a client supports in various
		     * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
		     *
		     * Please note that `MarkupKinds` must not start with a `$`. This kinds
		     * are reserved for internal usage.
		     */var MarkupKind;(function(MarkupKind){/**
		         * Checks whether the given value is a value of the {@link MarkupKind} type.
		         */function is(value){var candidate=value;return candidate===MarkupKind.PlainText||candidate===MarkupKind.Markdown}MarkupKind.PlainText="plaintext",MarkupKind.Markdown="markdown",MarkupKind.is=is})(MarkupKind||(exports.MarkupKind=MarkupKind={}));var MarkupContent;(function(MarkupContent){/**
		         * Checks whether the given value conforms to the {@link MarkupContent} interface.
		         */function is(value){var candidate=value;return Is.objectLiteral(value)&&MarkupKind.is(candidate.kind)&&Is.string(candidate.value)}MarkupContent.is=is})(MarkupContent||(exports.MarkupContent=MarkupContent={}));/**
		     * The kind of a completion entry.
		     */var CompletionItemKind;(function(CompletionItemKind){CompletionItemKind.Text=1,CompletionItemKind.Method=2,CompletionItemKind.Function=3,CompletionItemKind.Constructor=4,CompletionItemKind.Field=5,CompletionItemKind.Variable=6,CompletionItemKind.Class=7,CompletionItemKind.Interface=8,CompletionItemKind.Module=9,CompletionItemKind.Property=10,CompletionItemKind.Unit=11,CompletionItemKind.Value=12,CompletionItemKind.Enum=13,CompletionItemKind.Keyword=14,CompletionItemKind.Snippet=15,CompletionItemKind.Color=16,CompletionItemKind.File=17,CompletionItemKind.Reference=18,CompletionItemKind.Folder=19,CompletionItemKind.EnumMember=20,CompletionItemKind.Constant=21,CompletionItemKind.Struct=22,CompletionItemKind.Event=23,CompletionItemKind.Operator=24,CompletionItemKind.TypeParameter=25})(CompletionItemKind||(exports.CompletionItemKind=CompletionItemKind={}));/**
		     * Defines whether the insert text in a completion item should be interpreted as
		     * plain text or a snippet.
		     */var InsertTextFormat;(function(InsertTextFormat){InsertTextFormat.PlainText=1,InsertTextFormat.Snippet=2})(InsertTextFormat||(exports.InsertTextFormat=InsertTextFormat={}));/**
		     * Completion item tags are extra annotations that tweak the rendering of a completion
		     * item.
		     *
		     * @since 3.15.0
		     */var CompletionItemTag;(function(CompletionItemTag){CompletionItemTag.Deprecated=1})(CompletionItemTag||(exports.CompletionItemTag=CompletionItemTag={}));/**
		     * The InsertReplaceEdit namespace provides functions to deal with insert / replace edits.
		     *
		     * @since 3.16.0
		     */var InsertReplaceEdit;(function(InsertReplaceEdit){/**
		         * Creates a new insert / replace edit
		         */function create(newText,insert,replace){return{newText:newText,insert:insert,replace:replace}}/**
		         * Checks whether the given literal conforms to the {@link InsertReplaceEdit} interface.
		         */function is(value){var candidate=value;return candidate&&Is.string(candidate.newText)&&Range.is(candidate.insert)&&Range.is(candidate.replace)}InsertReplaceEdit.create=create,InsertReplaceEdit.is=is})(InsertReplaceEdit||(exports.InsertReplaceEdit=InsertReplaceEdit={}));/**
		     * How whitespace and indentation is handled during completion
		     * item insertion.
		     *
		     * @since 3.16.0
		     */var InsertTextMode;(function(InsertTextMode){InsertTextMode.asIs=1,InsertTextMode.adjustIndentation=2})(InsertTextMode||(exports.InsertTextMode=InsertTextMode={}));/**
		     * Defines how values from a set of defaults and an individual item will be
		     * merged.
		     *
		     * @since 3.18.0
		     */var ApplyKind;(function(ApplyKind){ApplyKind.Replace=1,ApplyKind.Merge=2})(ApplyKind||(exports.ApplyKind=ApplyKind={}));var CompletionItemLabelDetails;(function(CompletionItemLabelDetails){function is(value){var candidate=value;return candidate&&(Is.string(candidate.detail)||void 0===candidate.detail)&&(Is.string(candidate.description)||void 0===candidate.description)}CompletionItemLabelDetails.is=is})(CompletionItemLabelDetails||(exports.CompletionItemLabelDetails=CompletionItemLabelDetails={}));/**
		     * The CompletionItem namespace provides functions to deal with
		     * completion items.
		     */var CompletionItem;(function(CompletionItem){/**
		         * Create a completion item and seed it with a label.
		         * @param label The completion item's label
		         */function create(label){return{label:label}}CompletionItem.create=create})(CompletionItem||(exports.CompletionItem=CompletionItem={}));/**
		     * The CompletionList namespace provides functions to deal with
		     * completion lists.
		     */var CompletionList;(function(CompletionList){/**
		         * Creates a new completion list.
		         *
		         * @param items The completion items.
		         * @param isIncomplete The list is not complete.
		         */function create(items,isIncomplete){return{items:items?items:[],isIncomplete:!!isIncomplete}}CompletionList.create=create})(CompletionList||(exports.CompletionList=CompletionList={}));var MarkedString;(function(MarkedString){/**
		         * Creates a marked string from plain text.
		         *
		         * @param plainText The plain text.
		         */function fromPlainText(plainText){return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&");// escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
}/**
		         * Checks whether the given value conforms to the {@link MarkedString} type.
		         */function is(value){var candidate=value;return Is.string(candidate)||Is.objectLiteral(candidate)&&Is.string(candidate.language)&&Is.string(candidate.value)}MarkedString.fromPlainText=fromPlainText,MarkedString.is=is})(MarkedString||(exports.MarkedString=MarkedString={}));var Hover;(function(Hover){/**
		         * Checks whether the given value conforms to the {@link Hover} interface.
		         */function is(value){var candidate=value;return!!candidate&&Is.objectLiteral(candidate)&&(MarkupContent.is(candidate.contents)||MarkedString.is(candidate.contents)||Is.typedArray(candidate.contents,MarkedString.is))&&(void 0===value.range||Range.is(value.range))}Hover.is=is})(Hover||(exports.Hover=Hover={}));/**
		     * The ParameterInformation namespace provides helper functions to work with
		     * {@link ParameterInformation} literals.
		     */var ParameterInformation;(function(ParameterInformation){/**
		         * Creates a new parameter information literal.
		         *
		         * @param label A label string.
		         * @param documentation A doc string.
		         */function create(label,documentation){return documentation?{label:label,documentation:documentation}:{label:label}}ParameterInformation.create=create})(ParameterInformation||(exports.ParameterInformation=ParameterInformation={}));/**
		     * The SignatureInformation namespace provides helper functions to work with
		     * {@link SignatureInformation} literals.
		     */var SignatureInformation;(function(SignatureInformation){function create(label,documentation){for(var parameters=[],_i=2;_i<arguments.length;_i++)parameters[_i-2]=arguments[_i];var result={label:label};return Is.defined(documentation)&&(result.documentation=documentation),result.parameters=Is.defined(parameters)?parameters:[],result}SignatureInformation.create=create})(SignatureInformation||(exports.SignatureInformation=SignatureInformation={}));/**
		     * A document highlight kind.
		     */var DocumentHighlightKind;(function(DocumentHighlightKind){DocumentHighlightKind.Text=1,DocumentHighlightKind.Read=2,DocumentHighlightKind.Write=3})(DocumentHighlightKind||(exports.DocumentHighlightKind=DocumentHighlightKind={}));/**
		     * DocumentHighlight namespace to provide helper functions to work with
		     * {@link DocumentHighlight} literals.
		     */var DocumentHighlight;(function(DocumentHighlight){/**
		         * Create a DocumentHighlight object.
		         * @param range The range the highlight applies to.
		         * @param kind The highlight kind
		         */function create(range,kind){var result={range:range};return Is.number(kind)&&(result.kind=kind),result}DocumentHighlight.create=create})(DocumentHighlight||(exports.DocumentHighlight=DocumentHighlight={}));/**
		     * A symbol kind.
		     */var SymbolKind;(function(SymbolKind){SymbolKind.File=1,SymbolKind.Module=2,SymbolKind.Namespace=3,SymbolKind.Package=4,SymbolKind.Class=5,SymbolKind.Method=6,SymbolKind.Property=7,SymbolKind.Field=8,SymbolKind.Constructor=9,SymbolKind.Enum=10,SymbolKind.Interface=11,SymbolKind.Function=12,SymbolKind.Variable=13,SymbolKind.Constant=14,SymbolKind.String=15,SymbolKind.Number=16,SymbolKind.Boolean=17,SymbolKind.Array=18,SymbolKind.Object=19,SymbolKind.Key=20,SymbolKind.Null=21,SymbolKind.EnumMember=22,SymbolKind.Struct=23,SymbolKind.Event=24,SymbolKind.Operator=25,SymbolKind.TypeParameter=26})(SymbolKind||(exports.SymbolKind=SymbolKind={}));/**
		     * Symbol tags are extra annotations that tweak the rendering of a symbol.
		     *
		     * @since 3.16
		     */var SymbolTag;(function(SymbolTag){SymbolTag.Deprecated=1})(SymbolTag||(exports.SymbolTag=SymbolTag={}));var SymbolInformation;(function(SymbolInformation){/**
		         * Creates a new symbol information literal.
		         *
		         * @param name The name of the symbol.
		         * @param kind The kind of the symbol.
		         * @param range The range of the location of the symbol.
		         * @param uri The resource of the location of symbol.
		         * @param containerName The name of the symbol containing the symbol.
		         */function create(name,kind,range,uri,containerName){var result={name:name,kind:kind,location:{uri:uri,range:range}};return containerName&&(result.containerName=containerName),result}SymbolInformation.create=create})(SymbolInformation||(exports.SymbolInformation=SymbolInformation={}));var WorkspaceSymbol;(function(WorkspaceSymbol){/**
		         * Create a new workspace symbol.
		         *
		         * @param name The name of the symbol.
		         * @param kind The kind of the symbol.
		         * @param uri The resource of the location of the symbol.
		         * @param range An options range of the location.
		         * @returns A WorkspaceSymbol.
		         */function create(name,kind,uri,range){return void 0===range?{name:name,kind:kind,location:{uri:uri}}:{name:name,kind:kind,location:{uri:uri,range:range}}}WorkspaceSymbol.create=create})(WorkspaceSymbol||(exports.WorkspaceSymbol=WorkspaceSymbol={}));var DocumentSymbol;(function(DocumentSymbol){/**
		         * Creates a new symbol information literal.
		         *
		         * @param name The name of the symbol.
		         * @param detail The detail of the symbol.
		         * @param kind The kind of the symbol.
		         * @param range The range of the symbol.
		         * @param selectionRange The selectionRange of the symbol.
		         * @param children Children of the symbol.
		         */function create(name,detail,kind,range,selectionRange,children){var result={name:name,detail:detail,kind:kind,range:range,selectionRange:selectionRange};return void 0!==children&&(result.children=children),result}/**
		         * Checks whether the given literal conforms to the {@link DocumentSymbol} interface.
		         */function is(value){var candidate=value;return candidate&&Is.string(candidate.name)&&Is.number(candidate.kind)&&Range.is(candidate.range)&&Range.is(candidate.selectionRange)&&(void 0===candidate.detail||Is.string(candidate.detail))&&(void 0===candidate.deprecated||Is.boolean(candidate.deprecated))&&(void 0===candidate.children||Array.isArray(candidate.children))&&(void 0===candidate.tags||Array.isArray(candidate.tags))}DocumentSymbol.create=create,DocumentSymbol.is=is})(DocumentSymbol||(exports.DocumentSymbol=DocumentSymbol={}));/**
		     * A set of predefined code action kinds
		     */var CodeActionKind;(function(CodeActionKind){CodeActionKind.Empty="",CodeActionKind.QuickFix="quickfix",CodeActionKind.Refactor="refactor",CodeActionKind.RefactorExtract="refactor.extract",CodeActionKind.RefactorInline="refactor.inline",CodeActionKind.RefactorMove="refactor.move",CodeActionKind.RefactorRewrite="refactor.rewrite",CodeActionKind.Source="source",CodeActionKind.SourceOrganizeImports="source.organizeImports",CodeActionKind.SourceFixAll="source.fixAll",CodeActionKind.Notebook="notebook"})(CodeActionKind||(exports.CodeActionKind=CodeActionKind={}));/**
		     * The reason why code actions were requested.
		     *
		     * @since 3.17.0
		     */var CodeActionTriggerKind;(function(CodeActionTriggerKind){CodeActionTriggerKind.Invoked=1,CodeActionTriggerKind.Automatic=2})(CodeActionTriggerKind||(exports.CodeActionTriggerKind=CodeActionTriggerKind={}));/**
		     * The CodeActionContext namespace provides helper functions to work with
		     * {@link CodeActionContext} literals.
		     */var CodeActionContext;(function(CodeActionContext){/**
		         * Creates a new CodeActionContext literal.
		         */function create(diagnostics,only,triggerKind){var result={diagnostics:diagnostics};return void 0!==only&&null!==only&&(result.only=only),void 0!==triggerKind&&null!==triggerKind&&(result.triggerKind=triggerKind),result}/**
		         * Checks whether the given literal conforms to the {@link CodeActionContext} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Is.typedArray(candidate.diagnostics,Diagnostic.is)&&(void 0===candidate.only||Is.typedArray(candidate.only,Is.string))&&(void 0===candidate.triggerKind||candidate.triggerKind===CodeActionTriggerKind.Invoked||candidate.triggerKind===CodeActionTriggerKind.Automatic)}CodeActionContext.create=create,CodeActionContext.is=is})(CodeActionContext||(exports.CodeActionContext=CodeActionContext={}));/**
		     * Code action tags are extra annotations that tweak the behavior of a code action.
		     *
		     * @since 3.18.0
		     */var CodeActionTag;(function(CodeActionTag){/**
		         * Checks whether the given literal conforms to the {@link CodeActionTag} interface.
		         */function is(value){return Is.defined(value)&&value===CodeActionTag.LLMGenerated}CodeActionTag.LLMGenerated=1,CodeActionTag.is=is})(CodeActionTag||(exports.CodeActionTag=CodeActionTag={}));var CodeAction;(function(CodeAction){function create(title,kindOrCommandOrEdit,kind){var result={title:title},checkKind=!0;return"string"==typeof kindOrCommandOrEdit?(checkKind=!1,result.kind=kindOrCommandOrEdit):Command.is(kindOrCommandOrEdit)?result.command=kindOrCommandOrEdit:result.edit=kindOrCommandOrEdit,checkKind&&void 0!==kind&&(result.kind=kind),result}function is(value){var candidate=value;return candidate&&Is.string(candidate.title)&&(void 0===candidate.diagnostics||Is.typedArray(candidate.diagnostics,Diagnostic.is))&&(void 0===candidate.kind||Is.string(candidate.kind))&&(void 0!==candidate.edit||void 0!==candidate.command)&&(void 0===candidate.command||Command.is(candidate.command))&&(void 0===candidate.isPreferred||Is.boolean(candidate.isPreferred))&&(void 0===candidate.edit||WorkspaceEdit.is(candidate.edit))&&(void 0===candidate.tags||Is.typedArray(candidate.tags,CodeActionTag.is))}CodeAction.create=create,CodeAction.is=is})(CodeAction||(exports.CodeAction=CodeAction={}));/**
		     * The CodeLens namespace provides helper functions to work with
		     * {@link CodeLens} literals.
		     */var CodeLens;(function(CodeLens){/**
		         * Creates a new CodeLens literal.
		         */function create(range,data){var result={range:range};return Is.defined(data)&&(result.data=data),result}/**
		         * Checks whether the given literal conforms to the {@link CodeLens} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Range.is(candidate.range)&&(Is.undefined(candidate.command)||Command.is(candidate.command))}CodeLens.create=create,CodeLens.is=is})(CodeLens||(exports.CodeLens=CodeLens={}));/**
		     * The FormattingOptions namespace provides helper functions to work with
		     * {@link FormattingOptions} literals.
		     */var FormattingOptions;(function(FormattingOptions){/**
		         * Creates a new FormattingOptions literal.
		         */function create(tabSize,insertSpaces){return{tabSize:tabSize,insertSpaces:insertSpaces}}/**
		         * Checks whether the given literal conforms to the {@link FormattingOptions} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Is.uinteger(candidate.tabSize)&&Is.boolean(candidate.insertSpaces)}FormattingOptions.create=create,FormattingOptions.is=is})(FormattingOptions||(exports.FormattingOptions=FormattingOptions={}));/**
		     * The DocumentLink namespace provides helper functions to work with
		     * {@link DocumentLink} literals.
		     */var DocumentLink;(function(DocumentLink){/**
		         * Creates a new DocumentLink literal.
		         */function create(range,target,data){return{range:range,target:target,data:data}}/**
		         * Checks whether the given literal conforms to the {@link DocumentLink} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Range.is(candidate.range)&&(Is.undefined(candidate.target)||Is.string(candidate.target))}DocumentLink.create=create,DocumentLink.is=is})(DocumentLink||(exports.DocumentLink=DocumentLink={}));/**
		     * The SelectionRange namespace provides helper function to work with
		     * SelectionRange literals.
		     */var SelectionRange;(function(SelectionRange){/**
		         * Creates a new SelectionRange
		         * @param range the range.
		         * @param parent an optional parent.
		         */function create(range,parent){return{range:range,parent:parent}}function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Range.is(candidate.range)&&(void 0===candidate.parent||SelectionRange.is(candidate.parent))}SelectionRange.create=create,SelectionRange.is=is})(SelectionRange||(exports.SelectionRange=SelectionRange={}));/**
		     * A set of predefined token types. This set is not fixed
		     * an clients can specify additional token types via the
		     * corresponding client capabilities.
		     *
		     * @since 3.16.0
		     */var SemanticTokenTypes;(function(SemanticTokenTypes){SemanticTokenTypes.namespace="namespace",SemanticTokenTypes.type="type",SemanticTokenTypes["class"]="class",SemanticTokenTypes["enum"]="enum",SemanticTokenTypes["interface"]="interface",SemanticTokenTypes.struct="struct",SemanticTokenTypes.typeParameter="typeParameter",SemanticTokenTypes.parameter="parameter",SemanticTokenTypes.variable="variable",SemanticTokenTypes.property="property",SemanticTokenTypes.enumMember="enumMember",SemanticTokenTypes.event="event",SemanticTokenTypes["function"]="function",SemanticTokenTypes.method="method",SemanticTokenTypes.macro="macro",SemanticTokenTypes.keyword="keyword",SemanticTokenTypes.modifier="modifier",SemanticTokenTypes.comment="comment",SemanticTokenTypes.string="string",SemanticTokenTypes.number="number",SemanticTokenTypes.regexp="regexp",SemanticTokenTypes.operator="operator",SemanticTokenTypes.decorator="decorator",SemanticTokenTypes.label="label"})(SemanticTokenTypes||(exports.SemanticTokenTypes=SemanticTokenTypes={}));/**
		     * A set of predefined token modifiers. This set is not fixed
		     * an clients can specify additional token types via the
		     * corresponding client capabilities.
		     *
		     * @since 3.16.0
		     */var SemanticTokenModifiers;(function(SemanticTokenModifiers){SemanticTokenModifiers.declaration="declaration",SemanticTokenModifiers.definition="definition",SemanticTokenModifiers.readonly="readonly",SemanticTokenModifiers["static"]="static",SemanticTokenModifiers.deprecated="deprecated",SemanticTokenModifiers.abstract="abstract",SemanticTokenModifiers.async="async",SemanticTokenModifiers.modification="modification",SemanticTokenModifiers.documentation="documentation",SemanticTokenModifiers.defaultLibrary="defaultLibrary"})(SemanticTokenModifiers||(exports.SemanticTokenModifiers=SemanticTokenModifiers={}));/**
		     * @since 3.16.0
		     */var SemanticTokens;(function(SemanticTokens){function is(value){var candidate=value;return Is.objectLiteral(candidate)&&(void 0===candidate.resultId||"string"==typeof candidate.resultId)&&Array.isArray(candidate.data)&&(0===candidate.data.length||"number"==typeof candidate.data[0])}SemanticTokens.is=is})(SemanticTokens||(exports.SemanticTokens=SemanticTokens={}));/**
		     * The InlineValueText namespace provides functions to deal with InlineValueTexts.
		     *
		     * @since 3.17.0
		     */var InlineValueText;(function(InlineValueText){/**
		         * Creates a new InlineValueText literal.
		         */function create(range,text){return{range:range,text:text}}function is(value){var candidate=value;return void 0!==candidate&&null!==candidate&&Range.is(candidate.range)&&Is.string(candidate.text)}InlineValueText.create=create,InlineValueText.is=is})(InlineValueText||(exports.InlineValueText=InlineValueText={}));/**
		     * The InlineValueVariableLookup namespace provides functions to
		     * deal with InlineValueVariableLookups.
		     *
		     * @since 3.17.0
		     */var InlineValueVariableLookup;(function(InlineValueVariableLookup){/**
		         * Creates a new InlineValueText literal.
		         */function create(range,variableName,caseSensitiveLookup){return{range:range,variableName:variableName,caseSensitiveLookup:caseSensitiveLookup}}function is(value){var candidate=value;return void 0!==candidate&&null!==candidate&&Range.is(candidate.range)&&Is.boolean(candidate.caseSensitiveLookup)&&(Is.string(candidate.variableName)||void 0===candidate.variableName)}InlineValueVariableLookup.create=create,InlineValueVariableLookup.is=is})(InlineValueVariableLookup||(exports.InlineValueVariableLookup=InlineValueVariableLookup={}));/**
		     * The InlineValueEvaluatableExpression namespace provides functions to deal with InlineValueEvaluatableExpression.
		     *
		     * @since 3.17.0
		     */var InlineValueEvaluatableExpression;(function(InlineValueEvaluatableExpression){/**
		         * Creates a new InlineValueEvaluatableExpression literal.
		         */function create(range,expression){return{range:range,expression:expression}}function is(value){var candidate=value;return void 0!==candidate&&null!==candidate&&Range.is(candidate.range)&&(Is.string(candidate.expression)||void 0===candidate.expression)}InlineValueEvaluatableExpression.create=create,InlineValueEvaluatableExpression.is=is})(InlineValueEvaluatableExpression||(exports.InlineValueEvaluatableExpression=InlineValueEvaluatableExpression={}));/**
		     * The InlineValueContext namespace provides helper functions to work with
		     * {@link InlineValueContext} literals.
		     *
		     * @since 3.17.0
		     */var InlineValueContext;(function(InlineValueContext){/**
		         * Creates a new InlineValueContext literal.
		         */function create(frameId,stoppedLocation){return{frameId:frameId,stoppedLocation:stoppedLocation}}/**
		         * Checks whether the given literal conforms to the {@link InlineValueContext} interface.
		         */function is(value){var candidate=value;return Is.defined(candidate)&&Range.is(value.stoppedLocation)}InlineValueContext.create=create,InlineValueContext.is=is})(InlineValueContext||(exports.InlineValueContext=InlineValueContext={}));/**
		     * Inlay hint kinds.
		     *
		     * @since 3.17.0
		     */var InlayHintKind;(function(InlayHintKind){function is(value){return 1===value||2===value}InlayHintKind.Type=1,InlayHintKind.Parameter=2,InlayHintKind.is=is})(InlayHintKind||(exports.InlayHintKind=InlayHintKind={}));var InlayHintLabelPart;(function(InlayHintLabelPart){function create(value){return{value:value}}function is(value){var candidate=value;return Is.objectLiteral(candidate)&&(void 0===candidate.tooltip||Is.string(candidate.tooltip)||MarkupContent.is(candidate.tooltip))&&(void 0===candidate.location||Location.is(candidate.location))&&(void 0===candidate.command||Command.is(candidate.command))}InlayHintLabelPart.create=create,InlayHintLabelPart.is=is})(InlayHintLabelPart||(exports.InlayHintLabelPart=InlayHintLabelPart={}));var InlayHint;(function(InlayHint){function create(position,label,kind){var result={position:position,label:label};return void 0!==kind&&(result.kind=kind),result}function is(value){var candidate=value;return Is.objectLiteral(candidate)&&Position.is(candidate.position)&&(Is.string(candidate.label)||Is.typedArray(candidate.label,InlayHintLabelPart.is))&&(void 0===candidate.kind||InlayHintKind.is(candidate.kind))&&void 0===candidate.textEdits||Is.typedArray(candidate.textEdits,TextEdit.is)&&(void 0===candidate.tooltip||Is.string(candidate.tooltip)||MarkupContent.is(candidate.tooltip))&&(void 0===candidate.paddingLeft||Is.boolean(candidate.paddingLeft))&&(void 0===candidate.paddingRight||Is.boolean(candidate.paddingRight))}InlayHint.create=create,InlayHint.is=is})(InlayHint||(exports.InlayHint=InlayHint={}));var StringValue;(function(StringValue){function createSnippet(value){return{kind:"snippet",value:value}}function isSnippet(value){var candidate=value;return Is.objectLiteral(candidate)&&"snippet"===candidate.kind&&Is.string(candidate.value)}StringValue.createSnippet=createSnippet,StringValue.isSnippet=isSnippet})(StringValue||(exports.StringValue=StringValue={}));var InlineCompletionItem;(function(InlineCompletionItem){function create(insertText,filterText,range,command){return{insertText:insertText,filterText:filterText,range:range,command:command}}InlineCompletionItem.create=create})(InlineCompletionItem||(exports.InlineCompletionItem=InlineCompletionItem={}));var InlineCompletionList;(function(InlineCompletionList){function create(items){return{items:items}}InlineCompletionList.create=create})(InlineCompletionList||(exports.InlineCompletionList=InlineCompletionList={}));/**
		     * Describes how an {@link InlineCompletionItemProvider inline completion provider} was triggered.
		     *
		     * @since 3.18.0
		     */var InlineCompletionTriggerKind;(function(InlineCompletionTriggerKind){InlineCompletionTriggerKind.Invoked=1,InlineCompletionTriggerKind.Automatic=2})(InlineCompletionTriggerKind||(exports.InlineCompletionTriggerKind=InlineCompletionTriggerKind={}));var SelectedCompletionInfo;(function(SelectedCompletionInfo){function create(range,text){return{range:range,text:text}}SelectedCompletionInfo.create=create})(SelectedCompletionInfo||(exports.SelectedCompletionInfo=SelectedCompletionInfo={}));var InlineCompletionContext;(function(InlineCompletionContext){function create(triggerKind,selectedCompletionInfo){return{triggerKind:triggerKind,selectedCompletionInfo:selectedCompletionInfo}}InlineCompletionContext.create=create})(InlineCompletionContext||(exports.InlineCompletionContext=InlineCompletionContext={}));var WorkspaceFolder;(function(WorkspaceFolder){function is(value){var candidate=value;return Is.objectLiteral(candidate)&&URI.is(candidate.uri)&&Is.string(candidate.name)}WorkspaceFolder.is=is})(WorkspaceFolder||(exports.WorkspaceFolder=WorkspaceFolder={})),exports.EOL=["\n","\r\n","\r"];/**
		     * @deprecated Use the text document from the new vscode-languageserver-textdocument package.
		     */var TextDocument;(function(TextDocument){/**
		         * Creates a new ITextDocument literal from the given uri and content.
		         * @param uri The document's uri.
		         * @param languageId The document's language Id.
		         * @param version The document's version.
		         * @param content The document's content.
		         */function create(uri,languageId,version,content){return new FullTextDocument(uri,languageId,version,content)}/**
		         * Checks whether the given literal conforms to the {@link ITextDocument} interface.
		         */function is(value){var candidate=value;return!!(Is.defined(candidate)&&Is.string(candidate.uri)&&(Is.undefined(candidate.languageId)||Is.string(candidate.languageId))&&Is.uinteger(candidate.lineCount)&&Is.func(candidate.getText)&&Is.func(candidate.positionAt)&&Is.func(candidate.offsetAt))}function applyEdits(document,edits){for(var text=document.getText(),sortedEdits=mergeSort(edits,function(a,b){var diff=a.range.start.line-b.range.start.line;return 0==diff?a.range.start.character-b.range.start.character:diff}),lastModifiedOffset=text.length,i=sortedEdits.length-1;0<=i;i--){var e=sortedEdits[i],startOffset=document.offsetAt(e.range.start),endOffset=document.offsetAt(e.range.end);if(endOffset<=lastModifiedOffset)text=text.substring(0,startOffset)+e.newText+text.substring(endOffset,text.length);else throw new Error("Overlapping edit");lastModifiedOffset=startOffset}return text}function mergeSort(data,compare){if(1>=data.length)// sorted
return data;var p=0|data.length/2,left=data.slice(0,p),right=data.slice(p);mergeSort(left,compare),mergeSort(right,compare);for(var ret,leftIdx=0,rightIdx=0,i=0;leftIdx<left.length&&rightIdx<right.length;)ret=compare(left[leftIdx],right[rightIdx]),data[i++]=0>=ret?left[leftIdx++]:right[rightIdx++];for(;leftIdx<left.length;)data[i++]=left[leftIdx++];for(;rightIdx<right.length;)data[i++]=right[rightIdx++];return data}TextDocument.create=create,TextDocument.is=is,TextDocument.applyEdits=applyEdits})(TextDocument||(exports.TextDocument=TextDocument={}));/**
		     * @deprecated Use the text document from the new vscode-languageserver-textdocument package.
		     */var Is,FullTextDocument=/** @class */function(){function FullTextDocument(uri,languageId,version,content){this._uri=uri,this._languageId=languageId,this._version=version,this._content=content,this._lineOffsets=void 0}return Object.defineProperty(FullTextDocument.prototype,"uri",{get:function(){return this._uri},enumerable:!1,configurable:!0}),Object.defineProperty(FullTextDocument.prototype,"languageId",{get:function(){return this._languageId},enumerable:!1,configurable:!0}),Object.defineProperty(FullTextDocument.prototype,"version",{get:function(){return this._version},enumerable:!1,configurable:!0}),FullTextDocument.prototype.getText=function(range){if(range){var start=this.offsetAt(range.start),end=this.offsetAt(range.end);return this._content.substring(start,end)}return this._content},FullTextDocument.prototype.update=function(event,version){this._content=event.text,this._version=version,this._lineOffsets=void 0},FullTextDocument.prototype.getLineOffsets=function(){if(void 0===this._lineOffsets){for(var lineOffsets=[],text=this._content,isLineStart=!0,i=0;i<text.length;i++){isLineStart&&(lineOffsets.push(i),isLineStart=!1);var ch=text.charAt(i);isLineStart="\r"===ch||"\n"===ch,"\r"===ch&&i+1<text.length&&"\n"===text.charAt(i+1)&&i++}isLineStart&&0<text.length&&lineOffsets.push(text.length),this._lineOffsets=lineOffsets}return this._lineOffsets},FullTextDocument.prototype.positionAt=function(offset){offset=Math.max(Math.min(offset,this._content.length),0);var lineOffsets=this.getLineOffsets(),low=0,high=lineOffsets.length;if(0===high)return Position.create(0,offset);for(;low<high;){var mid=Math.floor((low+high)/2);lineOffsets[mid]>offset?high=mid:low=mid+1}// low is the least x for which the line offset is larger than the current offset
// or array.length if no line offset is larger than the current offset
var line=low-1;return Position.create(line,offset-lineOffsets[line])},FullTextDocument.prototype.offsetAt=function(position){var lineOffsets=this.getLineOffsets();if(position.line>=lineOffsets.length)return this._content.length;if(0>position.line)return 0;var lineOffset=lineOffsets[position.line],nextLineOffset=position.line+1<lineOffsets.length?lineOffsets[position.line+1]:this._content.length;return Math.max(Math.min(lineOffset+position.character,nextLineOffset),lineOffset)},Object.defineProperty(FullTextDocument.prototype,"lineCount",{get:function(){return this.getLineOffsets().length},enumerable:!1,configurable:!0}),FullTextDocument}();(function(Is){function defined(value){return"undefined"!=typeof value}function undefined$1(value){return"undefined"==typeof value}function boolean(value){return!0===value||!1===value}function string(value){return"[object String]"===toString.call(value)}function number(value){return"[object Number]"===toString.call(value)}function numberRange(value,min,max){return"[object Number]"===toString.call(value)&&min<=value&&value<=max}function integer(value){return"[object Number]"===toString.call(value)&&-2147483648<=value&&2147483647>=value}function uinteger(value){return"[object Number]"===toString.call(value)&&0<=value&&2147483647>=value}function func(value){return"[object Function]"===toString.call(value)}function objectLiteral(value){// Strictly speaking class instances pass this check as well. Since the LSP
// doesn't use classes we ignore this for now. If we do we need to add something
// like this: `Object.getPrototypeOf(Object.getPrototypeOf(x)) === null`
return null!==value&&"object"==typeof value}function typedArray(value,check){return Array.isArray(value)&&value.every(check)}var toString=Object.prototype.toString;Is.defined=defined,Is.undefined=undefined$1,Is.boolean=boolean,Is.string=string,Is.number=number,Is.numberRange=numberRange,Is.integer=integer,Is.uinteger=uinteger,Is.func=func,Is.objectLiteral=objectLiteral,Is.typedArray=typedArray})(Is||(Is={}))})}(main$1,main$1.exports),main$1.exports)}(),main=/*@__PURE__*/function getDefaultExportFromCjs(x){return x}(mainExports);return module.exports=main,module.exports}