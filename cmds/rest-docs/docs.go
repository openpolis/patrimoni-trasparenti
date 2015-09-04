
package main
//This file is generated automatically. Do not try to edit it manually.

var resourceListingJson = `{
    "apiVersion": "1.0.0",
    "swaggerVersion": "1.2",
    "apis": [
        {
            "path": "/users",
            "description": "Varie classifiche sui patrimoni dei parlamentari"
        }
    ],
    "info": {
        "title": "Patrimoni Trasparenti RESTapi",
        "description": "Openpolis Patrimoni trasparenti api. http://openpolis.it/"
    }
}`
var apiDescriptionsJson = map[string]string{"users":`{
    "apiVersion": "1.0.0",
    "swaggerVersion": "1.2",
    "basePath": "{{.}}",
    "resourcePath": "/users",
    "apis": [
        {
            "path": "/api/parlamentari/classifiche/",
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
                            "description": "User ID",
                            "dataType": "int",
                            "type": "int",
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
