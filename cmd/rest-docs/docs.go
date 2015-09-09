
package main
//This file is generated automatically. Do not try to edit it manually.

var resourceListingJson = `{
    "apiVersion": "0.1.0",
    "swaggerVersion": "1.2",
    "apis": [
        {
            "path": "/api",
            "description": "API politici"
        },
        {
            "path": "/tdb",
            "description": "TadaBoard API"
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
                        },
                        {
                            "code": 500,
                            "message": "Mhm, something went wrong",
                            "responseType": "object",
                            "responseModel": "string"
                        }
                    ]
                }
            ]
        }
    ]
}`,"tdb":`{
    "apiVersion": "0.1.0",
    "swaggerVersion": "1.2",
    "basePath": "{{.}}",
    "resourcePath": "/tdb",
    "apis": [
        {
            "path": "/api/tdb/test",
            "description": "Un endpoint per testare il funzionamento di TB",
            "operations": [
                {
                    "httpMethod": "GET",
                    "nickname": "Test dashboard",
                    "type": "bitbucket.org.eraclitux.op-incomes.TBDashTest",
                    "items": {},
                    "summary": "Un endpoint per testare il funzionamento di TB",
                    "parameters": [
                        {
                            "paramType": "query",
                            "name": "kind",
                            "description": "Un parametro",
                            "dataType": "string",
                            "type": "string",
                            "format": "",
                            "allowMultiple": false,
                            "required": true,
                            "minimum": 0,
                            "maximum": 0
                        },
                        {
                            "paramType": "query",
                            "name": "kind2",
                            "description": "Un altro parametro",
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
                            "message": "",
                            "responseType": "object",
                            "responseModel": "bitbucket.org.eraclitux.op-incomes.TBDashTest"
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
                        },
                        {
                            "code": 500,
                            "message": "Mhm, something went wrong",
                            "responseType": "object",
                            "responseModel": "string"
                        }
                    ]
                }
            ]
        }
    ],
    "models": {
        "bitbucket.org.eraclitux.op-incomes.TBDashTest": {
            "id": "bitbucket.org.eraclitux.op-incomes.TBDashTest",
            "required": [
                "status"
            ],
            "properties": {
                "error": {
                    "type": "error",
                    "description": "",
                    "items": {},
                    "format": ""
                },
                "query": {
                    "type": "array",
                    "description": "",
                    "items": {
                        "type": "string"
                    },
                    "format": ""
                },
                "status": {
                    "type": "bool",
                    "description": "",
                    "items": {},
                    "format": ""
                },
                "timestamp": {
                    "type": "int64",
                    "description": "",
                    "items": {},
                    "format": ""
                }
            }
        }
    }
}`,}
