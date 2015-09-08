
package main
//This file is generated automatically. Do not try to edit it manually.

var resourceListingJson = `{
    "apiVersion": "0.1.0",
    "swaggerVersion": "1.2",
    "apis": [
        {
            "path": "/api",
            "description": "Varie classifiche sui patrimoni dei parlamentari"
        }
    ],
    "info": {
        "title": "Patrimoni Trasparenti RESTapi",
        "description": "Openpolis Patrimoni trasparenti RESTapi. http://openpolis.it/"
    }
}`
var apiDescriptionsJson = map[string]string{"api":`{
    "apiVersion": "0.1.0",
    "swaggerVersion": "1.2",
    "basePath": "{{.}}",
    "resourcePath": "/api",
    "apis": [
        {
            "path": "/api/parlamentari/classifiche/{kind}",
            "description": "Varie classifiche sui patrimoni dei parlamentari",
            "operations": [
                {
                    "httpMethod": "GET",
                    "nickname": "Classifiche",
                    "type": "string",
                    "items": {},
                    "summary": "Varie classifiche sui patrimoni dei parlamentari",
                    "parameters": [
                        {
                            "paramType": "path",
                            "name": "kind",
                            "description": "Tipo della classifica desiderata {beni-immobili-totali|beni-immobili-coniuge}",
                            "dataType": "string",
                            "type": "string",
                            "format": "",
                            "allowMultiple": false,
                            "required": true,
                            "minimum": 0,
                            "maximum": 0
                        }
                    ],
                    "responseMessages": [
                        {
                            "code": 200,
                            "message": "Success",
                            "responseType": "object",
                            "responseModel": "string"
                        },
                        {
                            "code": 401,
                            "message": "Access denied",
                            "responseType": "object",
                            "responseModel": "string"
                        },
                        {
                            "code": 404,
                            "message": "Not Found",
                            "responseType": "object",
                            "responseModel": "string"
                        }
                    ]
                }
            ]
        }
    ]
}`,}
