// The different token types that can be collected
let TokenType={
	INTEGER:Symbol(),
	SYMBOL:Symbol(),
	FLOAT:Symbol(),
	STRING:Symbol(),
	COMMENT:Symbol(),
	REFERENCE:Symbol(),
	LABEL:Symbol(),
	NONE:Symbol(),
	IDENTIFIER:Symbol()
}

// Characters that separate tokens
let CharacterBlanks=[' ',"\n","\r","\t"]

// Reserved symbols that can not be part of identifiers, labels or references
let CharacterSymbols=['=','.',',','-','+','*','/','%','?','&','!','|','\'',';','<','>','(',')','{','}','[',']']

// Returns true for any character that is treated as a token separating blank
function isBlankCharacter(ch){
	for(var i=0;i<CharacterBlanks.length;i++)
		if(CharacterBlanks[i]==ch){
			return true;
		}
	return false;
}

// Returns true for any character that is treated as a special symbol in the Heluna syntax
function isSymbol(ch){
	for(var i=0;i<CharacterSymbols.length;i++)
		if(CharacterSymbols[i]==ch){
			return true;
		}
	return false;
}
	
// Returns true if a given character is a numeric digit
function isDigit(ch){
	return (ch>= '0' && ch <= '9');
}

// Creates a new exception that can be thrown
class ParseException{
	constructor(token,component,message) {
   		this.token=token
   		this.message = message
		this.name = component
	}
}

// Class used to hold all data and metadata for a single token
class Token{
	constructor(type,data,line,column){
		this.type=type
		this.data=data
		this.line=line
		this.column=column
	}
}

// Class used to hold the state needed by the tokenizer function
class TokenizerState{
	constructor(str,list){
		this.rawString=str
		this.list=list
		this.position=0;
		this.current=TokenType.NONE;
		this.buffer="";
		this.column=0;
		this.line=1;
		this.stored=-1;
		this.escaped=false;
	}

	pushBack(ch){
		this.stored=ch
	}

	read(){
		// If a character has been pushed back, return it now
		if(this.stored!==-1){
			var tmp=this.stored
			this.stored=-1
			return tmp
		}
		// If we have more characters, return the next
		if(this.position<this.rawString.length){
			var ch=this.rawString.charAt(this.position++);
			// Adjust line and column numbers as needed to track our location
			if(ch=="\n"){
				this.line++;
				this.column=1;
			}else{
				this.column++;
			}
			return ch;
		}else{
			return -1;
		}
	} 

	collectToken(tokenType,tokenData){
		this.list.addToken(new Token(tokenType,tokenData,this.line,this.column));
		this.buffer=""
		this.current=TokenType.NONE;
	}

	error(msg){
		// TODO: add line and column numbers
		// do nothing for now
		throw new ParseException(new Token(TokenType.NONE,"",this.line,this.column),"Tokenizer",msg);
	}
}

// Class used to hold the result of a string tokenization
class TokenList{
	constructor(str){
		this.rawString=str
		this.list=[]
		this.position=0
	}

	lastTokenWas(str){
		if(this.list.length==0)return false;
		if(this.list[this.list.length-1].data==str)return true;
		return false;
	}

	count(){
		return this.list.length
	}

	getToken(index){
		return this.list[index]
	}

	addToken(token){
		this.list.push(token)
	}

	reset(){
		this.position=0
	}

	getPosition(){
		return this.position
	}

	setPosition(position){
		this.position=position
	}

	// Returns the next available token or null if no more tokens are available
	next(){
		if(this.hasNext()){
			return this.list[this.position++]
		}else{
			return null
		}
	}

	// Returns the next available token or throws an exception with the given
	// message if no more tokens are available.
	requireNext(err){
		if(!this.hasNext())throw new ParseException(new Token(TokenType.NONE,"",-1,-1),"Parser",err)
		return this.next()
	}

	// Returns the next available token if it is a symbol. If there are no more
	// tokens, or the next token is not a symbol an exception will be thrown with
	// the given message.
	requireSymbol(err){
		var tkn=this.requireNext(err);
		if(tkn.type===TokenType.SYMBOL){
			return tkn
		}
		this.returnToken()
		throw new ParseException(tkn,"Parser",err);
	}

	// Returns true if next available token is a symbol matching the given string.
	consumeSymbol(str){
		if(!this.hasNext())return false
		var tkn=this.next()
		if(tkn.type===TokenType.SYMBOL && tkn.data===str){
			return true
		}
		this.returnToken()
		return false
	}

	// Returns the next available token if it is an identifier. If there are no more
	// tokens, or the next token is not an identifier an exception will be thrown with
	// the given message.
	requireIdentifier(err){
		var tkn=this.requireNext(err)
		if(tkn.type==TokenType.IDENTIFIER){
			return tkn;
		}
		this.returnToken()
		throw new ParseException(tkn,"Parser",err);
	}

	// Returns true if next available token is an identifier matching the given string.
	consumeIdentifier(str){
		if(!this.hasNext())return false
		var tkn=this.next()
		if(tkn.type===TokenType.IDENTIFIER && tkn.data===str){
			return true
		}
		this.returnToken()
		return false
	}

	// Returns true if next available token is an identifier matching the given string.
	// If not, an exception will be thrown with the given message.
	consumeIdentifierHard(str,err){
		var tkn=this.requireNext(err);
		if(tkn.type===TokenType.IDENTIFIER && tkn.data===str){
			return true
		}
		this.returnToken()
		throw new ParseException(tkn,"Parser",err)
	}

	hasNext(){
		return this.position<this.list.length
	}

	returnToken(){
		this.position--
		if(this.position<0){
			// For now just reset... but we should really throw an exception
			this.reset()
		}
	}
}

// Tokenizes a string based on the Heluna grammar.
// Returns a TokenList instance with results.
// Will throw a TokenizerException on syntax errors in the input.
function tokenizeString(rawString){
	var list=new TokenList(rawString)
	var state=new TokenizerState(rawString,list)
	// Read a single character from the input an start tokenizing
	var input=state.read();
	while(input!=-1){ // Continue until we run out of characters
		switch(state.current){
			case TokenType.NONE:
					// we are not currently in a token, start a new state
					if(!isBlankCharacter(input)){
						if(input=='"'){
							state.current=TokenType.STRING;
						}else if(input=='$'){
							state.current=TokenType.REFERENCE;
						}else if(isDigit(input)){
							state.buffer+=input;
							state.current=TokenType.INTEGER;
						}else if(input=='#'){
							state.current=TokenType.COMMENT;
						}else if(isSymbol(input)){
							state.collectToken(TokenType.SYMBOL,input);
						}else{
							state.buffer+=input;
							state.current=TokenType.IDENTIFIER;
						}
					}
				break;
			case TokenType.STRING:
					// We are currently reading a string literal, transform escaped characters and collect when " is reached
					if(state.escaped){
						switch(input){
							case 'n':state.buffer+="\n";break;
							case 'r':state.buffer+="\r";break;
							case 't':state.buffer+="\t";break;
							case "\\":state.buffer+="\\";break;
							case '"':state.buffer+='"';break;
							default: state.error("Unknown escape character '\\"+input+"' in string literal");
						}
						state.escaped=false;
					}else{
						if(input=='"'){
							state.collectToken(TokenType.STRING,state.buffer);
						}else if(input=="\\"){
							state.escaped=true;
						}else{
							state.buffer+=input;
						}
					}
				break;
			case TokenType.FLOAT:
			case TokenType.INTEGER:
					if(isDigit(input)){
						state.buffer+=input;
					}else if(isBlankCharacter(input)){
						state.collectToken(state.current,state.buffer);
					}else if(input=='.'){
						if(list.lastTokenWas(".")){
							// TODO: Find a way to handle this gracefully without introducing
							//       awareness of the actual language in the tokenizer.
							// we are probably in a list accessor, deny float change
							state.collectToken(state.current,state.buffer);
							state.pushBack(input) // push token
						}else{
							state.buffer+=input;
							state.current=TokenType.FLOAT;
						}
					}else if(input=='e'||input=='E'){
						state.buffer+='e';
						state.current=TokenType.FLOAT;
					}else if(input=='-'){
						var c2=state.buffer.charAt(state.buffer.length-1);
						if(c2=='e' || c2=='E'){
							state.buffer+=input;
							// next must be digit
							input=state.read();
							if(input==-1)state.error("Floating point literal using exponent notation missing a digit after e before end of code.");
							if(isDigit(input)){
								state.buffer+=input;
							}else state.error("Floating point literals using exponent notation must have a digit after e, instead '"+input+"' was found.");
						}else{
							state.collectToken(state.current,state.buffer);
							state.pushBack(input); // push token
						}
					}else if(state.buffer.endsWith("e")){
						state.error("Floating point literals using exponent notation must have a digit after e, instead '"+input+"' was found.");
					}else{
						state.collectToken(state.current,state.buffer);
						state.pushBack(input); // push token
					}
				break;
			case TokenType.COMMENT:
					// Collect comments until the end of the line
					if(input=="\n"){
						state.collectToken(state.current,state.buffer);
					}else{
						state.buffer+=input;
					}
				break;
			case TokenType.IDENTIFIER:
					if(isBlankCharacter(input)){
						state.collectToken(state.current,state.buffer);
					}else if(isSymbol(input)){
						state.collectToken(state.current,state.buffer);
						state.pushBack(input); // push token
					}else if(input==':'){
						state.current=TokenType.LABEL;
						state.collectToken(state.current,state.buffer);
					}else{
						state.buffer+=input;
					}
				break;
			case TokenType.LABEL:
			case TokenType.REFERENCE:
					if(isBlankCharacter(input)){
						state.collectToken(state.current,state.buffer);
					}else if(isSymbol(input)){
						state.collectToken(state.current,state.buffer);
						state.pushBack(input); // push token
					}else{
						state.buffer+=input;
					}
				break;
		}

		// Read a new character
		input=state.read();
	}
	// Check the sanity of our state after we have run out of characters and report any errors
	if(state.current==TokenType.STRING){
		// String literals must be closed before the end of the file, everything else is valid
		state.error("String literals must start and end with '\"'.");
	}else if(state.current==TokenType.FLOAT && state.buffer.endsWith("e")){
		state.error("Floating point literal using exponent notation missing a digit after e before end of code.")
	}else if(state.current!=TokenType.NONE){
		// If we have one last token being collected, collect it now
		state.collectToken(state.current,state.buffer);
	}
	// Return the result of the tokenization.
	// Any errors would have thrown an exception and never let us hit this point.
	return list;
}


module.exports = {tokenizeString,TokenType,ParseException};