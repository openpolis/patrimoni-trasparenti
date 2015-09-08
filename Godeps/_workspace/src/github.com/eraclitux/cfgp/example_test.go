package cfgp_test

import (
	"fmt"
	"log"

	"github.com/eraclitux/cfgp"
)

type myConf struct {
	Address string
	Port    string
	// A command line flag "-users", which expects an int value,
	// will be created.
	// Same key name will be searched in configuration file.
	NumberOfUsers int `cfgp:"users,number of users,"`
	Daemon        bool
}

func Example() {
	c := myConf{}
	//
	cfgp.Path = "test_data/one.ini"
	err := cfgp.Parse(&c)
	if err != nil {
		log.Fatal("Unable to parse configuration", err)
	}
	fmt.Println("address:", c.Address)
	fmt.Println("port:", c.Port)
	fmt.Println("number of users:", c.NumberOfUsers)

	//Output:
	//address: localhost
	//port: 8080
	//number of users: 42

}
