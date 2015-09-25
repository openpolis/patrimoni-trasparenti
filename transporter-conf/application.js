// create a pipeline that reads documents from a file, transforms them, and writes them
Source({name:"localmongo", namespace:"declarations.all"})
  .transform({name: "simpletrans", filename: "transformers/passthrough_and_log.js", debug: false})
  .save({name:"es", namespace:"declarations.all"})
//Source({name:"localmongo", namespace:"boom.foo"}).transform({name: "simpletrans", filename: "transformers/passthrough_and_log.js", debug: false}).save({name:"locales", namespace:"declarations.parla"})
