// json-formatter.js - version 0.1
// Copyright (c) 2015, Joaquin Blas
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the <organization> nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL JOAQUIN BLAS BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

(function( window ) {

var jsonTokenRegExp = /\s+|\{|\}|\[|\]|,|true|false|null|:|(?:"(?:\\\\|\\"|[^"])*")|(?:-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[Ee][+-]?[0-9]+)?)/g;

var TOKEN_UNKNOWN       =  0;
var TOKEN_WHITESPACE    =  1;
var TOKEN_BRACE_OPEN    =  2;
var TOKEN_BRACE_CLOSE   =  3;
var TOKEN_BRACKET_OPEN  =  4;
var TOKEN_BRACKET_CLOSE =  5;
var TOKEN_COMMA         =  6;
var TOKEN_COLON         =  7;
var TOKEN_TRUE          =  8;
var TOKEN_FALSE         =  9;
var TOKEN_NULL          = 10;
var TOKEN_STRING        = 11;
var TOKEN_NUMBER        = 12;

var charToTokenType = {
    ' ':  TOKEN_WHITESPACE,
    '\t': TOKEN_WHITESPACE,
    '\r': TOKEN_WHITESPACE,
    '\n': TOKEN_WHITESPACE,
    '{':  TOKEN_BRACE_OPEN,
    '}':  TOKEN_BRACE_CLOSE,
    '[':  TOKEN_BRACKET_OPEN,
    ']':  TOKEN_BRACKET_CLOSE,
    ',':  TOKEN_COMMA,
    ':':  TOKEN_COLON,
    't':  TOKEN_TRUE,
    'f':  TOKEN_FALSE,
    'n':  TOKEN_NULL,
    '"':  TOKEN_STRING,
    '-':  TOKEN_NUMBER,
    '0':  TOKEN_NUMBER,
    '1':  TOKEN_NUMBER,
    '2':  TOKEN_NUMBER,
    '3':  TOKEN_NUMBER,
    '4':  TOKEN_NUMBER,
    '5':  TOKEN_NUMBER,
    '6':  TOKEN_NUMBER,
    '7':  TOKEN_NUMBER,
    '8':  TOKEN_NUMBER,
    '9':  TOKEN_NUMBER
};

window.JSONFormatter = {
    tokenizeJSONString: function( json, options ) {
        var  tokens = [];
        var filterWS = options && options.filterWS;
        var filterUnknown = options && options.filterUnknown;
        var result = jsonTokenRegExp.exec( json );
    
        while ( result ) {
            var type = charToTokenType[ result[ 0 ].charAt( 0 ) ] || TOKEN_UNKNOWN;
    
            if ( ( !filterWS || type != TOKEN_WHITESPACE ) && ( !filterUnknown || type != TOKEN_UNKNOWN ) ) {
                 tokens.push({
                    type: type,
                    value: result[ 0 ]
                });
            }
    
            result = jsonTokenRegExp.exec( json );
        }
    
        return  tokens;
    },
    
    format: function( json ) {
        var  tokens = JSONFormatter.tokenizeJSONString( json || 'null', { filterWS: true, filterUnknown: true } );
        var numTokens = tokens.length;
        var output = [];
        var indentStack = [];
        var indent = '';
        var indentIncr = '    ';
        var index = 0;
        var prevTkn = null;
    
        while ( index <  numTokens ) {
            var tkn =  tokens[ index ];
            var nextTkn =  tokens[ index + 1 ];
            switch ( tkn.type ) {
                case TOKEN_BRACE_CLOSE:
                case TOKEN_BRACKET_CLOSE:
                    if ( indentStack.length > 0 ) {
                        indent = indentStack.pop();
                    }
    
                    if ( prevTkn && prevTkn.type != TOKEN_BRACE_OPEN && prevTkn.type != TOKEN_BRACKET_OPEN ) {
                        output.push( indent );
                    }
    
                    output.push( tkn.value );
    
                    if ( nextTkn && nextTkn.type != TOKEN_COMMA ) {
                        output.push( '\n' );
                    }
                    break;
                case TOKEN_BRACE_OPEN:
                case TOKEN_BRACKET_OPEN:
                    var openIndent = indent;
                    if ( prevTkn && prevTkn.type === TOKEN_COLON ) {
                        openIndent = '';
                    }
    
                    output.push( openIndent + tkn.value );
    
                    if ( nextTkn && nextTkn.type != TOKEN_BRACE_CLOSE && nextTkn.type != TOKEN_BRACKET_CLOSE ) {
                        output.push( '\n' );
                    }
    
                    indentStack.push( indent );
                    indent += indentIncr;
                    break;
                case TOKEN_COLON:
                    output.push( tkn.value + ' ' );            
                    break;
                case TOKEN_COMMA:
                    output.push( tkn.value + '\n' );
                    break;
                default:
                    var tknIndent = indent;
    
                    if ( prevTkn && prevTkn.type === TOKEN_COLON ) {
                        tknIndent = '';
                    }
                    output.push( tknIndent + tkn.value );
                    if ( !nextTkn || ( nextTkn.type != TOKEN_COLON && nextTkn.type != TOKEN_COMMA ) ) {
                        output.push( '\n' );                    
                    }
                    break;
            }
    
            ++index;
    
            prevTkn = tkn;
        }
    
        return output.join( '' );
    },
    
    minify: function( json ) {
        var  tokens = JSONFormatter.tokenizeJSONString( json || 'null', { filterWS: true, filterUnknown: true } );
        var  numTokens =  tokens.length;
        var  output = [];
        for ( var i = 0; i <  numTokens; i++ ) {
             output.push(  tokens[ i ].value )
        }
        return  output.join( '' );
    }
};

})( window );