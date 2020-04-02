# heluna-tokenizer
A simple a Javascript tokenizer for the Heluna programming language.

## Lexical Grammar
While the purpose of this package is to provide a tokenizer for the Heluna language, the grammer it uses is very simple and could easily be used to tokenize many other domain specific languages.

The following token types are recognized:

 * Integer: An integer in the form of one or more digits such as "256" or "3"
 * Float: A floating point number either as two sets of digits separated by a dot such as "3.141592" or "42.1", or as a floating point number followed by an exponent such as "54e-10" or "2.7e9"
 * Symbol: Any reserved symbol in the Heluna language which is the following set "=.,-+*/%?&!|';<>(){}[]"
 * String: Any set of characters enclosed in quotation marks such as "Hello World". Strings can contain escaped characters such as "Hello\n\"World\"" as well as inline new line characters.
 * Comment: Any set of characters from the character # to the end of the line
 * Identifier: Any set of alphanumeric characters starting with a letter such as "foo" or "bar42"
 * Reference: Any dollar sign followed by an identifier such as "$test" or "$foo9"
 * Label: Any identifier followed by a colon, such as "test:" or "foo9:"

## Usage Examples

````
var list=tokenizeString('foo + 3.141592e9')
console.log(list.count())
var tkn=list.getToken(0)
console.log(tkn.data)
if(tkn.type===TokenType.IDENTIFIER){
    console.log("Got an identifier")
}
````