
package main
//This file is generated automatically. Do not try to edit it manually.

var resourceListingJson = `{
    "apiVersion": "0.1.0",
    "swaggerVersion": "1.2",
    "basePath": "{{.}}",
    "apis": [
        {
            "path": "/api",
            "description": "politici API"
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
            "path": "/api/politici",
            "description": "Retrieve data for all politicians",
            "operations": [
                {
                    "httpMethod": "GET",
                    "nickname": "Retrieve data for all politicians",
                    "type": "bitbucket.org.eraclitux.op-incomes.TBDashTest",
                    "items": {},
                    "summary": "Retrieve data for all politicians",
                    "parameters": [
                        {
                            "paramType": "query",
                            "name": "gruppo",
                            "description": "Un parametro",
                            "dataType": "string",
                            "type": "string",
                            "format": "",
                            "allowMultiple": false,
                            "required": false,
                            "minimum": 0,
                            "maximum": 0
                        },
                        {
                            "paramType": "query",
                            "name": "istituzione",
                            "description": "Un altro parametro",
                            "dataType": "string",
                            "type": "string",
                            "format": "",
                            "allowMultiple": false,
                            "required": false,
                            "minimum": 0,
                            "maximum": 0
                        },
                        {
                            "paramType": "query",
                            "name": "circoscrizione",
                            "description": "Un altro parametro",
                            "dataType": "string",
                            "type": "string",
                            "format": "",
                            "allowMultiple": false,
                            "required": false,
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
                            "code": 500,
                            "message": "Mhm, something went wrong",
                            "responseType": "object",
                            "responseModel": "string"
                        }
                    ]
                }
            ]
        },
        {
            "path": "/api",
            "description": "Retrieve all endpoints",
            "operations": [
                {
                    "httpMethod": "GET",
                    "nickname": "Retrieve all endpoints",
                    "type": "bitbucket.org.eraclitux.op-incomes.TBDashTest",
                    "items": {},
                    "summary": "Retrieve all endpoints",
                    "responseMessages": [
                        {
                            "code": 200,
                            "message": "",
                            "responseType": "object",
                            "responseModel": "bitbucket.org.eraclitux.op-incomes.TBDashTest"
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
                "id": {
                    "type": "string",
                    "description": "",
                    "items": {},
                    "format": ""
                },
                "item": {
                    "type": "array",
                    "description": "",
                    "items": {
                        "$ref": "bitbucket.org.eraclitux.op-incomes.TBItem"
                    },
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
        },
        "bitbucket.org.eraclitux.op-incomes.TBItem": {
            "id": "bitbucket.org.eraclitux.op-incomes.TBItem",
            "properties": {
                "data": {
                    "type": "interface",
                    "description": "",
                    "items": {},
                    "format": ""
                },
                "id": {
                    "type": "string",
                    "description": "",
                    "items": {},
                    "format": ""
                },
                "tip": {
                    "type": "string",
                    "description": "",
                    "items": {},
                    "format": ""
                }
            }
        }
    }
}`,}
